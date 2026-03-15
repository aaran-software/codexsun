using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Vendors.Entities;

namespace cxtest;

public sealed class VendorWarehouseAccessTests
{
    [Fact]
    public async Task Vendor_can_list_only_company_owned_warehouses()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var setup = await SeedVendorWarehouseScenarioAsync(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            setup.PrimaryVendorUserId,
            "vendor-owner",
            "Vendor",
            ["inventory.view", "vendors.view"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);

        var response = await client.GetAsync("/vendors/warehouses");
        response.EnsureSuccessStatusCode();
        var warehouses = await AuthSecurityTestSupport.ReadRequiredAsync<List<WarehouseEnvelope>>(response);

        var ownedWarehouse = Assert.Single(warehouses, warehouse => warehouse.Id == setup.OwnedWarehouseId);
        Assert.Equal(setup.PrimaryVendorId, ownedWarehouse.VendorId);
        Assert.DoesNotContain(warehouses, warehouse => warehouse.Id == setup.OtherWarehouseId);
    }

    [Fact]
    public async Task Vendor_cannot_read_inventory_for_other_company_warehouse()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var setup = await SeedVendorWarehouseScenarioAsync(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            setup.PrimaryVendorUserId,
            "vendor-owner",
            "Vendor",
            ["inventory.view"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);

        var response = await client.GetAsync($"/inventory/warehouse/{setup.OtherWarehouseId}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadAsStringAsync();
        Assert.Contains("outside your vendor scope", payload, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<(Guid PrimaryVendorUserId, int PrimaryVendorId, int OwnedWarehouseId, int OtherWarehouseId)> SeedVendorWarehouseScenarioAsync(
        Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        return await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var now = DateTimeOffset.UtcNow;
            var primaryVendorUserId = Guid.NewGuid();
            var otherVendorUserId = Guid.NewGuid();

            dbContext.Users.AddRange(
                new User
                {
                    Id = primaryVendorUserId,
                    Username = $"vendor_{Guid.NewGuid():N}"[..15],
                    Email = $"vendor_{Guid.NewGuid():N}@example.com",
                    PasswordHash = "hash",
                    RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Status = "Active",
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new User
                {
                    Id = otherVendorUserId,
                    Username = $"vendor_{Guid.NewGuid():N}"[..15],
                    Email = $"vendor_{Guid.NewGuid():N}@example.com",
                    PasswordHash = "hash",
                    RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Status = "Active",
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                });

            var primaryVendor = new Vendor
            {
                CompanyName = $"Vendor Company {Guid.NewGuid():N}"[..24],
                LegalName = "Vendor Company Pvt Ltd",
                Status = "Active",
                CreatedAt = now,
                UpdatedAt = now
            };

            var otherVendor = new Vendor
            {
                CompanyName = $"Other Vendor {Guid.NewGuid():N}"[..24],
                LegalName = "Other Vendor Pvt Ltd",
                Status = "Active",
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Vendors.AddRange(primaryVendor, otherVendor);
            await dbContext.SaveChangesAsync();

            dbContext.VendorUsers.AddRange(
                new VendorUser
                {
                    VendorId = primaryVendor.Id,
                    UserId = primaryVendorUserId,
                    Role = "Owner",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new VendorUser
                {
                    VendorId = otherVendor.Id,
                    UserId = otherVendorUserId,
                    Role = "Owner",
                    CreatedAt = now,
                    UpdatedAt = now
                });

            var ownedWarehouse = new Warehouse
            {
                Name = $"Owned Warehouse {Guid.NewGuid():N}"[..24],
                Location = "Chennai",
                VendorId = primaryVendor.Id,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            var otherWarehouse = new Warehouse
            {
                Name = $"Other Warehouse {Guid.NewGuid():N}"[..24],
                Location = "Bengaluru",
                VendorId = otherVendor.Id,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            var category = new ProductCategory
            {
                Name = $"Warehouse Scope {Guid.NewGuid():N}"[..24],
                Slug = $"warehouse-scope-{Guid.NewGuid():N}"[..32],
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Warehouses.AddRange(ownedWarehouse, otherWarehouse);
            dbContext.ProductCategories.Add(category);
            await dbContext.SaveChangesAsync();

            var currencyId = await dbContext.Currencies.OrderBy(x => x.Id).Select(x => x.Id).FirstAsync();
            var product = new Product
            {
                OwnerUserId = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                CategoryId = category.Id,
                CurrencyId = currencyId,
                Sku = $"WH-{Guid.NewGuid():N}"[..12],
                Name = $"Warehouse Scoped {Guid.NewGuid():N}"[..26],
                Slug = $"warehouse-scoped-{Guid.NewGuid():N}"[..36],
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
                WarehouseId = otherWarehouse.Id,
                Quantity = 12,
                ReservedQuantity = 0,
                ReorderLevel = 0,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            await dbContext.SaveChangesAsync();
            return (primaryVendorUserId, primaryVendor.Id, ownedWarehouse.Id, otherWarehouse.Id);
        });
    }

    private sealed class WarehouseEnvelope
    {
        public int Id { get; set; }
        public int? VendorId { get; set; }
    }
}
