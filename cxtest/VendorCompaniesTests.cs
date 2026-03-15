using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Products.Entities;

namespace cxtest;

public sealed class VendorCompaniesTests
{
    [Fact]
    public async Task Admin_can_create_vendor_company_and_assign_vendor_user()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["vendors.view", "vendors.manage", "vendors.users.manage"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);

        var vendorUserId = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var now = DateTimeOffset.UtcNow;
            var id = Guid.NewGuid();

            dbContext.Users.Add(new User
            {
                Id = id,
                Username = $"vendor_{Guid.NewGuid():N}"[..15],
                Email = $"vendor_{Guid.NewGuid():N}@example.com",
                PasswordHash = "hash",
                RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Status = "Active",
                IsDeleted = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            await dbContext.SaveChangesAsync();
            return id;
        });

        var createResponse = await client.PostAsJsonAsync("/vendors", new
        {
            companyName = "Northwind Vendor House",
            legalName = "Northwind Vendor House Private Limited",
            gstNumber = "29ABCDE1234F1Z6",
            panNumber = "ABCDE1234F",
            email = "contact@northwind.example",
            phone = "9999999999",
            website = "https://northwind.example",
            logoUrl = "",
            status = "Active",
            addresses = Array.Empty<object>(),
            bankAccounts = Array.Empty<object>()
        });

        createResponse.EnsureSuccessStatusCode();
        var createdVendor = await AuthSecurityTestSupport.ReadRequiredAsync<VendorEnvelope>(createResponse);

        var assignResponse = await client.PostAsJsonAsync($"/vendors/{createdVendor.Id}/users", new
        {
            userId = vendorUserId,
            role = "Owner"
        });

        assignResponse.EnsureSuccessStatusCode();
        var assignedUser = await AuthSecurityTestSupport.ReadRequiredAsync<VendorUserEnvelope>(assignResponse);

        Assert.Equal(createdVendor.Id, assignedUser.VendorId);
        Assert.Equal(vendorUserId, assignedUser.UserId);
        Assert.Equal("Owner", assignedUser.Role);
    }

    [Fact]
    public async Task Product_creation_copies_vendor_company_id_from_vendor_user_assignment()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["Product.Create", "Product.Read", "vendors.view", "vendors.manage", "vendors.users.manage"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);

        var setup = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var now = DateTimeOffset.UtcNow;
            var vendorUserId = Guid.NewGuid();

            dbContext.Users.Add(new User
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

            var category = new ProductCategory
            {
                Name = $"Vendor Products {Guid.NewGuid():N}"[..24],
                Slug = $"vendor-products-{Guid.NewGuid():N}"[..32],
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.ProductCategories.Add(category);
            await dbContext.SaveChangesAsync();

            var currencyId = await dbContext.Currencies.OrderBy(x => x.Id).Select(x => x.Id).FirstAsync();
            return new { VendorUserId = vendorUserId, CategoryId = category.Id, CurrencyId = currencyId };
        });

        var vendorCreateResponse = await client.PostAsJsonAsync("/vendors", new
        {
            companyName = "Contoso Supplies",
            legalName = "Contoso Supplies LLP",
            gstNumber = "29ABCDE9876Q1Z2",
            panNumber = "ABCDE9876Q",
            email = "hello@contoso.example",
            phone = "8888888888",
            website = "https://contoso.example",
            logoUrl = "",
            status = "Active",
            addresses = Array.Empty<object>(),
            bankAccounts = Array.Empty<object>()
        });

        vendorCreateResponse.EnsureSuccessStatusCode();
        var vendor = await AuthSecurityTestSupport.ReadRequiredAsync<VendorEnvelope>(vendorCreateResponse);

        var assignResponse = await client.PostAsJsonAsync($"/vendors/{vendor.Id}/users", new
        {
            userId = setup.VendorUserId,
            role = "Owner"
        });

        assignResponse.EnsureSuccessStatusCode();

        var productResponse = await client.PostAsJsonAsync("/products", new
        {
            vendorUserId = setup.VendorUserId,
            categoryId = setup.CategoryId,
            currencyId = setup.CurrencyId,
            sku = $"VP-{Guid.NewGuid():N}"[..12],
            name = $"Vendor Product {Guid.NewGuid():N}"[..26],
            slug = "",
            shortDescription = "",
            description = "",
            basePrice = 120m,
            costPrice = 80m,
            isPublished = true,
            isActive = true,
            variants = Array.Empty<object>(),
            prices = new[]
            {
                new
                {
                    priceType = "Retail",
                    salesChannel = "Online",
                    minQuantity = 1,
                    price = 120m,
                    currencyId = setup.CurrencyId
                }
            },
            images = Array.Empty<object>(),
            inventory = Array.Empty<object>(),
            vendorLinks = Array.Empty<object>(),
            attributes = Array.Empty<object>()
        });

        productResponse.EnsureSuccessStatusCode();

        var savedProduct = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Products
                .AsNoTracking()
                .SingleAsync(x => x.VendorUserId == setup.VendorUserId));

        Assert.Equal(vendor.Id, savedProduct.VendorId);
    }

    private sealed class VendorEnvelope
    {
        public int Id { get; set; }
    }

    private sealed class VendorUserEnvelope
    {
        public int VendorId { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
