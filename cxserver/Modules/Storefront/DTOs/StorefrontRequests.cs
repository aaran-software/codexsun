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
