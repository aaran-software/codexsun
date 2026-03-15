using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.Entities;

namespace cxtest;

public sealed class EnterpriseModulesTests
{
    [Fact]
    public async Task Admin_can_apply_coupon_to_existing_order()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = CreateAdminClient(factory);

        var orderId = await CreateOrderAsync(factory);

        var couponResponse = await client.PostAsJsonAsync("/coupons", new
        {
            code = $"SAVE{Guid.NewGuid():N}"[..10],
            discountType = "Flat",
            discountValue = 50m,
            usageLimit = 5,
            startDate = DateTimeOffset.UtcNow.AddDays(-1),
            endDate = DateTimeOffset.UtcNow.AddDays(30),
            isActive = true
        });

        couponResponse.EnsureSuccessStatusCode();
        var coupon = await AuthSecurityTestSupport.ReadRequiredAsync<CouponEnvelope>(couponResponse);

        var applyResponse = await client.PostAsJsonAsync("/coupons/apply", new
        {
            code = coupon.Code,
            orderId
        });

        applyResponse.EnsureSuccessStatusCode();

        var order = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Orders.AsNoTracking().SingleAsync(x => x.Id == orderId));

        Assert.Equal(50m, order.DiscountAmount);
        Assert.Equal(150m, order.TotalAmount);
    }

    [Fact]
    public async Task Admin_can_create_shipment_for_order_item()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = CreateAdminClient(factory);

        var setup = await CreateOrderWithItemAsync(factory);

        var response = await client.PostAsJsonAsync("/shipments", new
        {
            orderId = setup.OrderId,
            shippingMethodId = 1,
            trackingNumber = $"TRK-{Guid.NewGuid():N}"[..16],
            items = new[]
            {
                new
                {
                    orderItemId = setup.OrderItemId,
                    quantity = 2
                }
            }
        });

        response.EnsureSuccessStatusCode();
        var shipment = await AuthSecurityTestSupport.ReadRequiredAsync<ShipmentEnvelope>(response);

        Assert.Equal(setup.OrderId, shipment.OrderId);
        Assert.Equal("Created", shipment.Status);
        Assert.Single(shipment.Items);
    }

    [Fact]
    public async Task Admin_can_create_approve_and_refund_return()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = CreateAdminClient(factory);

        var setup = await CreateOrderWithItemAsync(factory);

        var createReturn = await client.PostAsJsonAsync("/returns", new
        {
            orderId = setup.OrderId,
            returnReason = "Damaged during delivery",
            items = new[]
            {
                new
                {
                    orderItemId = setup.OrderItemId,
                    productId = setup.ProductId,
                    quantity = 1,
                    returnReason = "Damaged during delivery",
                    condition = "Damaged",
                    resolutionType = "Refund"
                }
            }
        });

        createReturn.EnsureSuccessStatusCode();
        var createdReturn = await AuthSecurityTestSupport.ReadRequiredAsync<ReturnEnvelope>(createReturn);

        var approveReturn = await client.PostAsJsonAsync($"/returns/{createdReturn.Id}/approve", new
        {
            notes = "Approved"
        });

        approveReturn.EnsureSuccessStatusCode();

        var refundResponse = await client.PostAsJsonAsync("/refunds/process", new
        {
            returnId = createdReturn.Id,
            warehouseId = setup.WarehouseId,
            amount = 0m,
            transactionReference = $"RFD-{Guid.NewGuid():N}"[..16],
            status = "Processed"
        });

        refundResponse.EnsureSuccessStatusCode();
        var refund = await AuthSecurityTestSupport.ReadRequiredAsync<RefundEnvelope>(refundResponse);

        Assert.Equal("Processed", refund.Status);
        Assert.Equal(createdReturn.Id, refund.ReturnId);
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
            ["inventory.view", "inventory.manage", "inventory.transfer", "inventory.adjust", "vendors.view", "vendors.manage"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }

    private static Task<int> CreateOrderAsync(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
        => AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var setup = await CreateOrderWithItemInternalAsync(dbContext);
            return setup.OrderId;
        });

    private static Task<(int OrderId, int OrderItemId, int ProductId, int WarehouseId)> CreateOrderWithItemAsync(
        Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
        => AuthSecurityTestSupport.WithDbContextAsync(factory, CreateOrderWithItemInternalAsync);

    private static async Task<(int OrderId, int OrderItemId, int ProductId, int WarehouseId)> CreateOrderWithItemInternalAsync(
        cxserver.Infrastructure.CodexsunDbContext dbContext)
    {
        var now = DateTimeOffset.UtcNow;
        var category = new ProductCategory
        {
            Name = $"Enterprise {Guid.NewGuid():N}"[..20],
            Slug = $"enterprise-{Guid.NewGuid():N}"[..30],
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.ProductCategories.Add(category);
        await dbContext.SaveChangesAsync();

        var currency = await dbContext.Currencies.OrderBy(x => x.Id).FirstAsync();
        var warehouse = await dbContext.Warehouses.OrderBy(x => x.Id).FirstAsync();

        var product = new Product
        {
            OwnerUserId = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            CategoryId = category.Id,
            CurrencyId = currency.Id,
            Sku = $"ENT-{Guid.NewGuid():N}"[..12],
            Name = $"Enterprise Product {Guid.NewGuid():N}"[..28],
            Slug = $"enterprise-product-{Guid.NewGuid():N}"[..36],
            ShortDescription = string.Empty,
            Description = string.Empty,
            BasePrice = 100m,
            CostPrice = 70m,
            IsPublished = true,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync();

        dbContext.ProductInventory.Add(new ProductInventory
        {
            ProductId = product.Id,
            WarehouseId = warehouse.Id,
            Quantity = 20,
            ReservedQuantity = 0,
            ReorderLevel = 1,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        });

        var order = new Order
        {
            OrderNumber = $"SO-{Guid.NewGuid():N}"[..16],
            CurrencyId = currency.Id,
            OrderStatus = "Confirmed",
            PaymentStatus = "Pending",
            Subtotal = 200m,
            TaxAmount = 0m,
            DiscountAmount = 0m,
            TotalAmount = 200m,
            CreatedAt = now,
            UpdatedAt = now
        };

        order.Items.Add(new OrderItem
        {
            ProductId = product.Id,
            Quantity = 2,
            UnitPrice = 100m,
            TaxAmount = 0m,
            TotalPrice = 200m,
            CreatedAt = now,
            UpdatedAt = now
        });

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync();
        return (order.Id, order.Items.Single().Id, product.Id, warehouse.Id);
    }

    private sealed class CouponEnvelope
    {
        public string Code { get; set; } = string.Empty;
    }

    private sealed class ShipmentEnvelope
    {
        public int OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<object> Items { get; set; } = [];
    }

    private sealed class ReturnEnvelope
    {
        public int Id { get; set; }
    }

    private sealed class RefundEnvelope
    {
        public int? ReturnId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
