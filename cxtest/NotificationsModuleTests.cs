using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using cxtest.AuthSecurityTests;
using cxserver.Infrastructure;
using cxserver.Modules.AfterSales.DTOs;
using cxserver.Modules.AfterSales.Services;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Services;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;
using cxserver.Modules.Shipping.DTOs;
using cxserver.Modules.Shipping.Services;
using cxserver.Modules.Vendors.Entities;

namespace cxtest;

public sealed class NotificationsModuleTests
{
    [Fact]
    public async Task User_registration_queues_and_processes_notifications()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var publicClient = AuthSecurityTestSupport.CreateClient(factory);
        using var adminClient = CreateAdminClient(factory);
        var registerRequest = AuthSecurityTestSupport.CreateRegisterRequest("notify");

        var registerResponse = await publicClient.PostAsJsonAsync("/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        var registeredUserId = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Users
                .Where(x => x.Email == registerRequest.Email.ToLower())
                .Select(x => x.Id)
                .SingleAsync());

        var pendingCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Notifications.CountAsync(x => x.UserId == registeredUserId && x.Status == "Pending"));

        Assert.True(pendingCount >= 1);

        var processResponse = await adminClient.PostAsync("/notifications/settings/process", content: null);
        processResponse.EnsureSuccessStatusCode();

        var sentCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Notifications.CountAsync(x => x.UserId == registeredUserId && x.Status == "Sent"));

        var logsCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.NotificationLogs
                .Include(x => x.Notification)
                .CountAsync(x => x.Notification.UserId == registeredUserId && x.Status == "Sent"));

        Assert.True(sentCount >= 1);
        Assert.True(logsCount >= 1);
    }

    [Fact]
    public async Task Commerce_workflows_queue_all_required_notification_events()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        var setup = await SeedCommerceNotificationScenarioAsync(factory);

        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CodexsunDbContext>();
        var salesService = scope.ServiceProvider.GetRequiredService<SalesService>();
        var shippingService = scope.ServiceProvider.GetRequiredService<ShippingService>();
        var afterSalesService = scope.ServiceProvider.GetRequiredService<AfterSalesService>();
        var inventoryService = scope.ServiceProvider.GetRequiredService<InventoryService>();
        var sessionId = $"customer-notification-session-{Guid.NewGuid():N}";

        await salesService.AddItemToCartAsync(new CartItemUpsertRequest
        {
            SessionId = sessionId,
            ProductId = setup.ProductId,
            Quantity = 2,
            VendorUserId = setup.VendorUserId,
            CurrencyId = setup.CurrencyId
        }, setup.CustomerUserId, CancellationToken.None);

        var order = await salesService.CreateOrderAsync(new CreateOrderRequest
        {
            SessionId = sessionId,
            IdempotencyKey = $"notify-{Guid.NewGuid():N}",
            CurrencyId = setup.CurrencyId,
            ShippingMethod = setup.ShippingMethodName,
            PaymentMethod = "cod",
            BillingAddress = BuildAddress("Billing"),
            ShippingAddress = BuildAddress("Shipping")
        }, setup.CustomerUserId, "Customer", "127.0.0.1", CancellationToken.None);

        var invoiceId = await dbContext.Invoices
            .Where(x => x.OrderId == order.Id)
            .Select(x => x.Id)
            .SingleAsync();

        await salesService.RecordPaymentAsync(new RecordPaymentRequest
        {
            InvoiceId = invoiceId,
            Amount = order.TotalAmount,
            CurrencyId = setup.CurrencyId,
            Provider = "Manual",
            TransactionReference = $"TXN-{Guid.NewGuid():N}"[..16]
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        var orderItemId = await dbContext.OrderItems
            .Where(x => x.OrderId == order.Id)
            .Select(x => x.Id)
            .SingleAsync();

        var shippedShipment = await shippingService.CreateShipmentAsync(new ShipmentCreateRequest
        {
            OrderId = order.Id,
            ShippingMethodId = setup.ShippingMethodId,
            TrackingNumber = $"SHIP-{Guid.NewGuid():N}"[..16],
            Items =
            [
                new ShipmentItemCreateRequest
                {
                    OrderItemId = orderItemId,
                    Quantity = 2
                }
            ]
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        await shippingService.UpdateShipmentStatusAsync(shippedShipment.Id, new ShipmentStatusUpdateRequest
        {
            Status = "Delivered"
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        var createdReturn = await afterSalesService.CreateReturnRequestAsync(new CreateReturnRequest
        {
            OrderId = order.Id,
            ReturnReason = "Notification return test",
            Items =
            [
                new CreateReturnItemRequest
                {
                    OrderItemId = orderItemId,
                    ProductId = setup.ProductId,
                    Quantity = 1,
                    ReturnReason = "Notification return test",
                    Condition = "Opened",
                    ResolutionType = "Refund"
                }
            ]
        }, setup.CustomerUserId, "Customer", "127.0.0.1", CancellationToken.None);

        await afterSalesService.ApproveReturnAsync(createdReturn.Id, new ApproveReturnRequest
        {
            Notes = "Approved for notification test"
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        await salesService.CreateVendorPayoutAsync(new CreateVendorPayoutRequest
        {
            VendorUserId = setup.VendorUserId,
            CurrencyId = setup.CurrencyId
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        await inventoryService.AdjustInventoryAsync(new InventoryAdjustmentRequest
        {
            WarehouseId = setup.WarehouseId,
            Reason = "Trigger low inventory alert",
            Items =
            [
                new InventoryAdjustmentItemRequest
                {
                    ProductId = setup.ProductId,
                    NewQuantity = 1
                }
            ]
        }, setup.AdminUserId, "Admin", "127.0.0.1", CancellationToken.None);

        var notificationCounts = await AuthSecurityTestSupport.WithDbContextAsync(factory, async context =>
            await context.Notifications
                .Include(x => x.Template)
                .GroupBy(x => x.Template.Code)
                .Select(group => new { group.Key, Count = group.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count));

        Assert.True(notificationCounts.TryGetValue("ORDER_CREATED", out var orderCreatedCount) && orderCreatedCount >= 1);
        Assert.True(notificationCounts.TryGetValue("PAYMENT_SUCCESS", out var paymentSuccessCount) && paymentSuccessCount >= 1);
        Assert.True(notificationCounts.TryGetValue("SHIPMENT_SHIPPED", out var shipmentShippedCount) && shipmentShippedCount >= 1);
        Assert.True(notificationCounts.TryGetValue("SHIPMENT_DELIVERED", out var shipmentDeliveredCount) && shipmentDeliveredCount >= 1);
        Assert.True(notificationCounts.TryGetValue("RETURN_APPROVED", out var returnApprovedCount) && returnApprovedCount >= 1);
        Assert.True(notificationCounts.TryGetValue("VENDOR_PAYOUT_CREATED", out var vendorPayoutCount) && vendorPayoutCount >= 1);
        Assert.True(notificationCounts.TryGetValue("LOW_INVENTORY_ALERT", out var lowInventoryCount) && lowInventoryCount >= 1);
    }

    private static HttpClient CreateAdminClient(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        var client = AuthSecurityTestSupport.CreateClient(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["User.Read", "inventory.view", "vendors.view"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }

    private static OrderAddressRequest BuildAddress(string addressType) => new()
    {
        AddressType = addressType,
        AddressLine1 = "42 Commerce Street",
        AddressLine2 = "Suite 7",
        City = "Chennai",
        State = "Tamil Nadu",
        Country = "India",
        PostalCode = "600001"
    };

    private static async Task<(Guid AdminUserId, Guid CustomerUserId, Guid VendorUserId, int ProductId, int CurrencyId, int WarehouseId, int ShippingMethodId, string ShippingMethodName)> SeedCommerceNotificationScenarioAsync(
        Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        return await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var now = DateTimeOffset.UtcNow;
            var adminUserId = Guid.Parse("55555555-5555-5555-5555-555555555555");
            var customerUserId = Guid.NewGuid();
            var vendorUserId = Guid.NewGuid();

            dbContext.Users.AddRange(
                new User
                {
                    Id = customerUserId,
                    Username = $"customer_{Guid.NewGuid():N}"[..17],
                    Email = $"customer_{Guid.NewGuid():N}@example.com",
                    PasswordHash = "hash",
                    RoleId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Status = "Active",
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new User
                {
                    Id = vendorUserId,
                    Username = $"vendor_{Guid.NewGuid():N}"[..15],
                    Email = $"vendor_{Guid.NewGuid():N}@example.com",
                    PasswordHash = "hash",
                    RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Status = "Active",
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                });

            var vendor = new Vendor
            {
                CompanyName = $"Notify Vendor {Guid.NewGuid():N}"[..24],
                LegalName = "Notify Vendor Pvt Ltd",
                Status = "Active",
                CreatedAt = now,
                UpdatedAt = now
            };

            var category = new ProductCategory
            {
                Name = $"Notify Category {Guid.NewGuid():N}"[..24],
                Slug = $"notify-category-{Guid.NewGuid():N}"[..36],
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Vendors.Add(vendor);
            dbContext.ProductCategories.Add(category);
            await dbContext.SaveChangesAsync();

            dbContext.VendorUsers.Add(new VendorUser
            {
                VendorId = vendor.Id,
                UserId = vendorUserId,
                Role = "Owner",
                CreatedAt = now,
                UpdatedAt = now
            });

            var currency = await dbContext.Currencies.OrderBy(x => x.Id).FirstAsync();
            var warehouse = await dbContext.Warehouses.OrderBy(x => x.Id).FirstAsync();
            var shippingMethod = await dbContext.ShippingMethods.OrderBy(x => x.Id).FirstAsync();

            var product = new Product
            {
                OwnerUserId = adminUserId,
                VendorUserId = vendorUserId,
                VendorId = vendor.Id,
                CategoryId = category.Id,
                CurrencyId = currency.Id,
                Sku = $"NTF-{Guid.NewGuid():N}"[..12],
                Name = $"Notify Product {Guid.NewGuid():N}"[..26],
                Slug = $"notify-product-{Guid.NewGuid():N}"[..36],
                ShortDescription = string.Empty,
                Description = string.Empty,
                BasePrice = 120m,
                CostPrice = 90m,
                IsPublished = true,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();

            dbContext.ProductVendorLinks.Add(new ProductVendorLink
            {
                ProductId = product.Id,
                VendorUserId = vendorUserId,
                VendorId = vendor.Id,
                VendorSku = $"VSKU-{Guid.NewGuid():N}"[..14],
                VendorSpecificPrice = 115m,
                VendorInventory = 25,
                CreatedAt = now,
                UpdatedAt = now
            });

            dbContext.ProductInventory.Add(new ProductInventory
            {
                ProductId = product.Id,
                WarehouseId = warehouse.Id,
                Quantity = 20,
                ReservedQuantity = 0,
                ReorderLevel = 2,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            await dbContext.SaveChangesAsync();
            return (adminUserId, customerUserId, vendorUserId, product.Id, currency.Id, warehouse.Id, shippingMethod.Id, shippingMethod.Name);
        });
    }
}
