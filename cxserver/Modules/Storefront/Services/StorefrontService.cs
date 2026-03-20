using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Storefront.DTOs;
using cxserver.Modules.Storefront.Entities;

namespace cxserver.Modules.Storefront.Services;

public sealed class StorefrontService(CodexsunDbContext dbContext)
{
    public async Task<IReadOnlyList<CustomerAddressResponse>> GetCustomerAddressesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.Set<CustomerAddress>()
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.UpdatedAt)
            .Select(MapCustomerAddress())
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerAddressResponse> UpsertCustomerAddressAsync(int? addressId, CustomerAddressUpsertRequest request, Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        ValidateAddress(request);

        var now = DateTimeOffset.UtcNow;
        CustomerAddress? address = null;
        var action = "Address.Create";

        if (addressId is > 0)
        {
            address = await dbContext.Set<CustomerAddress>()
                .SingleOrDefaultAsync(x => x.Id == addressId.Value && x.UserId == userId, cancellationToken);

            if (address is null)
            {
                throw new InvalidOperationException("Address was not found.");
            }

            action = "Address.Update";
        }

        if (request.IsDefault)
        {
            var existingDefaults = await dbContext.Set<CustomerAddress>()
                .Where(x => x.UserId == userId && x.IsDefault && (address == null || x.Id != address.Id))
                .ToListAsync(cancellationToken);

            foreach (var existingDefault in existingDefaults)
            {
                existingDefault.IsDefault = false;
                existingDefault.UpdatedAt = now;
            }
        }

        if (address is null)
        {
            address = new CustomerAddress
            {
                UserId = userId,
                CreatedAt = now,
            };
            dbContext.Set<CustomerAddress>().Add(address);
        }

        address.Label = request.Label.Trim();
        address.FullName = request.FullName.Trim();
        address.Phone = request.Phone.Trim();
        address.Email = request.Email.Trim();
        address.AddressLine1 = request.AddressLine1.Trim();
        address.AddressLine2 = request.AddressLine2.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.Country = request.Country.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.IsDefault = request.IsDefault;
        address.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(userId, action, nameof(CustomerAddress), address.Id.ToString(), ipAddress, cancellationToken);

        return await dbContext.Set<CustomerAddress>()
            .AsNoTracking()
            .Where(x => x.Id == address.Id)
            .Select(MapCustomerAddress())
            .SingleAsync(cancellationToken);
    }

    public async Task<bool> DeleteCustomerAddressAsync(int addressId, Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        var address = await dbContext.Set<CustomerAddress>()
            .SingleOrDefaultAsync(x => x.Id == addressId && x.UserId == userId, cancellationToken);

        if (address is null)
        {
            return false;
        }

        dbContext.Set<CustomerAddress>().Remove(address);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(userId, "Address.Delete", nameof(CustomerAddress), addressId.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<WishlistItemResponse>> GetWishlistAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.WishlistEntries
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapWishlistItem())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WishlistItemResponse>> AddWishlistItemAsync(int productId, Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .SingleOrDefaultAsync(x => x.Id == productId && x.IsActive && x.IsPublished, cancellationToken);

        if (product is null)
        {
            throw new InvalidOperationException("Product was not found.");
        }

        var existing = await dbContext.WishlistEntries
            .SingleOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId, cancellationToken);

        if (existing is null)
        {
            var now = DateTimeOffset.UtcNow;
            dbContext.WishlistEntries.Add(new WishlistEntry
            {
                UserId = userId,
                ProductId = productId,
                CreatedAt = now,
                UpdatedAt = now
            });

            await dbContext.SaveChangesAsync(cancellationToken);
            await WriteAuditLogAsync(userId, "Wishlist.Add", nameof(WishlistEntry), productId.ToString(), ipAddress, cancellationToken);
        }

        return await GetWishlistAsync(userId, cancellationToken);
    }

    public async Task<bool> RemoveWishlistItemAsync(int productId, Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        var entry = await dbContext.WishlistEntries
            .SingleOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId, cancellationToken);

        if (entry is null)
        {
            return false;
        }

        dbContext.WishlistEntries.Remove(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(userId, "Wishlist.Remove", nameof(WishlistEntry), productId.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task ClearWishlistAsync(Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        var entries = await dbContext.WishlistEntries
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);

        if (entries.Count == 0)
        {
            return;
        }

        dbContext.WishlistEntries.RemoveRange(entries);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(userId, "Wishlist.Clear", nameof(WishlistEntry), userId.ToString(), ipAddress, cancellationToken);
    }

    public async Task<IReadOnlyList<ProductReviewResponse>> GetProductReviewsAsync(int productId, CancellationToken cancellationToken)
    {
        return await dbContext.ProductReviews
            .AsNoTracking()
            .Where(x => x.ProductId == productId && x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapReview())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductReviewResponse>> GetMyReviewsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.ProductReviews
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapReview())
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductReviewResponse> CreateProductReviewAsync(ProductReviewCreateRequest request, Guid userId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureCustomer(role);

        if (request.ProductId <= 0)
        {
            throw new InvalidOperationException("Product is required.");
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new InvalidOperationException("Rating must be between 1 and 5.");
        }

        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Review))
        {
            throw new InvalidOperationException("Review title and review text are required.");
        }

        var product = await dbContext.Products
            .SingleOrDefaultAsync(x => x.Id == request.ProductId && x.IsActive && x.IsPublished, cancellationToken);

        if (product is null)
        {
            throw new InvalidOperationException("Product was not found.");
        }

        var exists = await dbContext.ProductReviews
            .AnyAsync(x => x.UserId == userId && x.ProductId == request.ProductId, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("You have already reviewed this product.");
        }

        var isVerifiedPurchase = await dbContext.OrderItems
            .AnyAsync(x => x.ProductId == request.ProductId
                && x.Order.CustomerUserId == userId
                && x.Order.OrderStatus != "Cancelled", cancellationToken);

        if (!isVerifiedPurchase)
        {
            throw new InvalidOperationException("Only customers who purchased the product can submit a review.");
        }

        var now = DateTimeOffset.UtcNow;
        var review = new ProductReview
        {
            UserId = userId,
            ProductId = request.ProductId,
            Rating = request.Rating,
            Title = request.Title.Trim(),
            Review = request.Review.Trim(),
            IsApproved = true,
            IsVerifiedPurchase = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.ProductReviews.Add(review);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(userId, "Review.Create", nameof(ProductReview), review.Id.ToString(), ipAddress, cancellationToken);

        return await dbContext.ProductReviews
            .AsNoTracking()
            .Where(x => x.Id == review.Id)
            .Select(MapReview())
            .SingleAsync(cancellationToken);
    }

    private static Expression<Func<WishlistEntry, WishlistItemResponse>> MapWishlistItem()
    {
        return x => new WishlistItemResponse
        {
            Id = x.Id,
            ProductId = x.ProductId,
            Slug = x.Product.Slug,
            Name = x.Product.Name,
            VendorName = x.Product.VendorUser != null ? x.Product.VendorUser.Username : string.Empty,
            VendorCompanyName = x.Product.Vendor != null ? x.Product.Vendor.CompanyName : string.Empty,
            Price = x.Product.BasePrice,
            CurrencyName = x.Product.Currency != null ? x.Product.Currency.Name : string.Empty,
            ImageUrl = x.Product.Images
                .OrderByDescending(image => image.IsPrimary)
                .ThenBy(image => image.SortOrder)
                .Select(image => image.ImageUrl)
                .FirstOrDefault() ?? string.Empty,
            AddedAt = x.CreatedAt
        };
    }

    private static Expression<Func<ProductReview, ProductReviewResponse>> MapReview()
    {
        return x => new ProductReviewResponse
        {
            Id = x.Id,
            ProductId = x.ProductId,
            UserId = x.UserId.ToString(),
            Username = x.User.Username,
            Rating = x.Rating,
            Title = x.Title,
            Review = x.Review,
            IsApproved = x.IsApproved,
            IsVerifiedPurchase = x.IsVerifiedPurchase,
            CreatedAt = x.CreatedAt
        };
    }

    private static Expression<Func<CustomerAddress, CustomerAddressResponse>> MapCustomerAddress()
    {
        return x => new CustomerAddressResponse
        {
            Id = x.Id,
            Label = x.Label,
            FullName = x.FullName,
            Phone = x.Phone,
            Email = x.Email,
            AddressLine1 = x.AddressLine1,
            AddressLine2 = x.AddressLine2,
            City = x.City,
            State = x.State,
            Country = x.Country,
            PostalCode = x.PostalCode,
            IsDefault = x.IsDefault,
            CreatedAt = x.CreatedAt
        };
    }

    private static void ValidateAddress(CustomerAddressUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Label)
            || string.IsNullOrWhiteSpace(request.FullName)
            || string.IsNullOrWhiteSpace(request.Phone)
            || string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.AddressLine1)
            || string.IsNullOrWhiteSpace(request.City)
            || string.IsNullOrWhiteSpace(request.State)
            || string.IsNullOrWhiteSpace(request.Country)
            || string.IsNullOrWhiteSpace(request.PostalCode))
        {
            throw new InvalidOperationException("All required address fields must be provided.");
        }
    }

    private static void EnsureCustomer(string role)
    {
        if (!string.Equals(role, "Customer", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Only customers can use this action.");
        }
    }

    private async Task WriteAuditLogAsync(Guid userId, string action, string entityType, string entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Module = "Storefront",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
