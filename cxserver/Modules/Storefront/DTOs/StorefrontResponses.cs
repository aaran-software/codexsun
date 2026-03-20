namespace cxserver.Modules.Storefront.DTOs;

public sealed class WishlistItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string VendorCompanyName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CurrencyName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTimeOffset AddedAt { get; set; }
}

public sealed class ProductReviewResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Review { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public bool IsVerifiedPurchase { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class CustomerAddressResponse
{
    public int Id { get; set; }
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
    public DateTimeOffset CreatedAt { get; set; }
}
