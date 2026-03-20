using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Products.Entities;

namespace cxserver.Modules.Storefront.Entities;

public abstract class StorefrontEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class WishlistEntry : StorefrontEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

public sealed class ProductReview : StorefrontEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Review { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
    public bool IsVerifiedPurchase { get; set; }
}

public sealed class CustomerAddress : StorefrontEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Label { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
