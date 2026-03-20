namespace cxserver.Modules.Storefront.DTOs;

public sealed class WishlistAddRequest
{
    public int ProductId { get; set; }
}

public sealed class ProductReviewCreateRequest
{
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Review { get; set; } = string.Empty;
}

public sealed class CustomerAddressUpsertRequest
{
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
