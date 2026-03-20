using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Products.Entities;

namespace cxtest;

public sealed class ProductPricingTests
{
    [Fact]
    public async Task Product_create_requires_a_retail_price_row()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["Product.Create", "Product.Read"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);

        var setup = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var category = new ProductCategory
            {
                Name = $"Pricing Category {Guid.NewGuid():N}"[..24],
                Slug = $"pricing-category-{Guid.NewGuid():N}"[..32],
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            dbContext.ProductCategories.Add(category);
            await dbContext.SaveChangesAsync();

            var currencyId = await dbContext.Currencies.OrderBy(x => x.Id).Select(x => x.Id).FirstAsync();
            return new { category.Id, CurrencyId = currencyId };
        });

        var response = await client.PostAsJsonAsync("/products", new
        {
            categoryId = setup.Id,
            currencyId = setup.CurrencyId,
            sku = $"PR-{Guid.NewGuid():N}"[..12],
            name = $"Pricing Product {Guid.NewGuid():N}"[..28],
            slug = "",
            shortDescription = "",
            description = "",
            basePrice = 120m,
            costPrice = 90m,
            isPublished = true,
            isActive = true,
            variants = Array.Empty<object>(),
            prices = new[]
            {
                new
                {
                    priceType = "Wholesale",
                    salesChannel = "Wholesale",
                    minQuantity = 10,
                    price = 85m,
                    currencyId = setup.CurrencyId
                }
            },
            images = Array.Empty<object>(),
            inventory = Array.Empty<object>(),
            vendorLinks = Array.Empty<object>(),
            attributes = Array.Empty<object>()
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadAsStringAsync();
        Assert.Contains("retail price row is required", payload, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Cart_pricing_uses_vendor_then_wholesale_when_quantity_changes()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var setup = await SeedProductWithPricingAsync(factory, includeOffer: false);
        var sessionId = $"pricing-session-{Guid.NewGuid():N}"[..24];

        var addResponse = await client.PostAsJsonAsync("/cart/items", new
        {
            sessionId,
            productId = setup.ProductId,
            quantity = 10,
            vendorUserId = setup.VendorId
        });

        addResponse.EnsureSuccessStatusCode();
        var addedCart = await AuthSecurityTestSupport.ReadRequiredAsync<CartEnvelope>(addResponse);
        var addedItem = Assert.Single(addedCart.Items);
        Assert.Equal(80m, addedItem.UnitPrice);

        using var updateRequest = new HttpRequestMessage(HttpMethod.Put, $"/cart/items/{addedItem.Id}")
        {
            Content = JsonContent.Create(new
            {
                quantity = 60
            })
        };
        updateRequest.Headers.Add("X-Cart-Session-Id", sessionId);

        var updateResponse = await client.SendAsync(updateRequest);

        updateResponse.EnsureSuccessStatusCode();
        var updatedCart = await AuthSecurityTestSupport.ReadRequiredAsync<CartEnvelope>(updateResponse);
        var updatedItem = Assert.Single(updatedCart.Items);
        Assert.Equal(70m, updatedItem.UnitPrice);
    }

    [Fact]
    public async Task Cart_pricing_uses_active_offer_before_wholesale_and_retail()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var setup = await SeedProductWithPricingAsync(factory, includeOffer: true);

        var response = await client.PostAsJsonAsync("/cart/items", new
        {
            sessionId = $"offer-session-{Guid.NewGuid():N}"[..22],
            productId = setup.ProductId,
            quantity = 60
        });

        response.EnsureSuccessStatusCode();
        var cart = await AuthSecurityTestSupport.ReadRequiredAsync<CartEnvelope>(response);
        var item = Assert.Single(cart.Items);
        Assert.Equal(60m, item.UnitPrice);
    }

    private static async Task<(int ProductId, Guid VendorId)> SeedProductWithPricingAsync(
        Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory,
        bool includeOffer)
    {
        return await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
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
                Name = $"Pricing Seed {Guid.NewGuid():N}"[..22],
                Slug = $"pricing-seed-{Guid.NewGuid():N}"[..30],
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.ProductCategories.Add(category);
            await dbContext.SaveChangesAsync();

            var currencyId = await dbContext.Currencies.OrderBy(x => x.Id).Select(x => x.Id).FirstAsync();
            var product = new Product
            {
                OwnerUserId = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                CategoryId = category.Id,
                CurrencyId = currencyId,
                Sku = $"PRICE-{Guid.NewGuid():N}"[..14],
                Name = $"Pricing Product {Guid.NewGuid():N}"[..28],
                Slug = $"pricing-product-{Guid.NewGuid():N}"[..36],
                ShortDescription = string.Empty,
                Description = string.Empty,
                BasePrice = 100m,
                CostPrice = 65m,
                IsPublished = true,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
                Prices =
                [
                    new ProductPrice
                    {
                        PriceType = "Retail",
                        SalesChannel = "Online",
                        MinQuantity = 1,
                        Price = 100m,
                        CurrencyId = currencyId,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    },
                    new ProductPrice
                    {
                        PriceType = "Wholesale",
                        SalesChannel = "Wholesale",
                        MinQuantity = 50,
                        Price = 70m,
                        CurrencyId = currencyId,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    },
                    new ProductPrice
                    {
                        PriceType = "Vendor",
                        SalesChannel = "Vendor",
                        MinQuantity = 1,
                        Price = 80m,
                        CurrencyId = currencyId,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    }
                ],
                VendorLinks =
                [
                    new ProductVendorLink
                    {
                        VendorUserId = vendorId,
                        VendorSku = $"V-{Guid.NewGuid():N}"[..10],
                        VendorSpecificPrice = 75m,
                        VendorInventory = 30,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    }
                ]
            };

            if (includeOffer)
            {
                product.Prices.Add(new ProductPrice
                {
                    PriceType = "Offer",
                    SalesChannel = "Online",
                    MinQuantity = 1,
                    Price = 60m,
                    CurrencyId = currencyId,
                    StartDate = now.AddDays(-1),
                    EndDate = now.AddDays(1),
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();
            return (product.Id, vendorId);
        });
    }

    private sealed class CartEnvelope
    {
        public List<CartItemEnvelope> Items { get; set; } = [];
    }

    private sealed class CartItemEnvelope
    {
        public int Id { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
