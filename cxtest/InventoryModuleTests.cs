using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Products.Entities;

namespace cxtest;

public sealed class InventoryModuleTests
{
    [Fact]
    public async Task Admin_can_create_and_receive_purchase_order_into_inventory()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var accessToken = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["inventory.view", "inventory.manage", "inventory.transfer", "inventory.adjust"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, accessToken);

        var setup = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var now = DateTimeOffset.UtcNow;
            var vendorId = Guid.NewGuid();

            dbContext.Users.Add(new User
            {
                Id = vendorId,
                Username = $"vendor_{Guid.NewGuid():N}"[..15],
                Email = $"vendor_{Guid.NewGuid():N}@example.com",
                PasswordHash = "hash",
                RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Status = "Active",
                IsDeleted = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            var category = new ProductCategory
            {
                Name = $"Inventory Test {Guid.NewGuid():N}"[..22],
                Slug = $"inventory-test-{Guid.NewGuid():N}"[..30],
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
                Sku = $"INV-{Guid.NewGuid():N}"[..12],
                Name = $"Inventory Product {Guid.NewGuid():N}"[..28],
                Slug = $"inventory-product-{Guid.NewGuid():N}"[..36],
                ShortDescription = string.Empty,
                Description = string.Empty,
                BasePrice = 25,
                CostPrice = 20,
                IsPublished = true,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();

            return new { VendorId = vendorId, ProductId = product.Id, CurrencyId = currency.Id, WarehouseId = warehouse.Id };
        });

        var createResponse = await client.PostAsJsonAsync("/inventory/purchase-orders", new
        {
            VendorUserId = setup.VendorId,
            CurrencyId = setup.CurrencyId,
            Items = new[]
            {
                new
                {
                    ProductId = setup.ProductId,
                    Quantity = 5,
                    UnitPrice = 20m
                }
            }
        });

        createResponse.EnsureSuccessStatusCode();
        var purchaseOrder = await AuthSecurityTestSupport.ReadRequiredAsync<PurchaseOrderEnvelope>(createResponse);

        Assert.Equal("Open", purchaseOrder.Status);
        Assert.Equal(100m, purchaseOrder.TotalAmount);

        var receiveResponse = await client.PostAsJsonAsync($"/inventory/purchase-orders/{purchaseOrder.Id}/receive", new
        {
            WarehouseId = setup.WarehouseId
        });

        receiveResponse.EnsureSuccessStatusCode();

        var inventoryResponse = await client.GetAsync($"/inventory/warehouse/{setup.WarehouseId}");
        inventoryResponse.EnsureSuccessStatusCode();
        var inventory = await AuthSecurityTestSupport.ReadRequiredAsync<List<InventorySummaryEnvelope>>(inventoryResponse);

        var productInventory = Assert.Single(inventory, x => x.ProductId == setup.ProductId);
        Assert.Equal(5, productInventory.QuantityOnHand);
    }

    private sealed class PurchaseOrderEnvelope
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
    }

    private sealed class InventorySummaryEnvelope
    {
        public int ProductId { get; set; }
        public int QuantityOnHand { get; set; }
    }
}
