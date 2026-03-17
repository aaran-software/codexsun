namespace cxserver.Modules.Products.DTOs;

public sealed class ProductCategoryResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public sealed class ProductVariantResponse
{
    public int Id { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string VariantName { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal CostPrice { get; init; }
    public int InventoryQuantity { get; init; }
    public bool IsActive { get; init; }
}

public sealed class ProductPriceResponse
{
    public int Id { get; init; }
    public int? ProductVariantId { get; init; }
    public string PriceType { get; init; } = string.Empty;
    public string SalesChannel { get; init; } = string.Empty;
    public int MinQuantity { get; init; }
    public decimal Price { get; init; }
    public int? CurrencyId { get; init; }
    public string CurrencyName { get; init; } = string.Empty;
    public DateTimeOffset? StartDate { get; init; }
    public DateTimeOffset? EndDate { get; init; }
}

public sealed class ProductImageResponse
{
    public int Id { get; init; }
    public string ImageUrl { get; init; } = string.Empty;
    public string AltText { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
    public int SortOrder { get; init; }
}

public sealed class ProductInventoryResponse
{
    public int Id { get; init; }
    public int? WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public int ReservedQuantity { get; init; }
    public int ReorderLevel { get; init; }
}

public sealed class ProductVendorLinkResponse
{
    public int Id { get; init; }
    public Guid VendorUserId { get; init; }
    public int? VendorId { get; init; }
    public string VendorCompanyName { get; init; } = string.Empty;
    public string VendorName { get; init; } = string.Empty;
    public string VendorSku { get; init; } = string.Empty;
    public decimal VendorSpecificPrice { get; init; }
    public int VendorInventory { get; init; }
}

public sealed class ProductAttributeValueResponse
{
    public int Id { get; init; }
    public string Value { get; init; } = string.Empty;
    public int? ProductVariantId { get; init; }
}

public sealed class ProductAttributeResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public IReadOnlyList<ProductAttributeValueResponse> Values { get; init; } = [];
}

public class ProductListItemResponse
{
    public int Id { get; init; }
    public Guid OwnerUserId { get; init; }
    public Guid? VendorUserId { get; init; }
    public int? VendorId { get; init; }
    public string VendorCompanyName { get; init; } = string.Empty;
    public string VendorName { get; init; } = string.Empty;
    public int? GroupId { get; init; }
    public string GroupName { get; init; } = string.Empty;
    public int? TypeId { get; init; }
    public string TypeName { get; init; } = string.Empty;
    public int? CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public int? UnitId { get; init; }
    public string UnitName { get; init; } = string.Empty;
    public int? CurrencyId { get; init; }
    public string CurrencyName { get; init; } = string.Empty;
    public int? GstPercentId { get; init; }
    public decimal? GstPercent { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public decimal BasePrice { get; init; }
    public decimal CostPrice { get; init; }
    public bool IsPublished { get; init; }
    public bool IsActive { get; init; }
    public int TotalInventory { get; init; }
    public decimal AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class ProductDetailResponse : ProductListItemResponse
{
    public string ShortDescription { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int? BrandId { get; init; }
    public string BrandName { get; init; } = string.Empty;
    public int? HsnCodeId { get; init; }
    public string HsnCode { get; init; } = string.Empty;
    public IReadOnlyList<ProductVariantResponse> Variants { get; init; } = [];
    public IReadOnlyList<ProductPriceResponse> Prices { get; init; } = [];
    public IReadOnlyList<ProductImageResponse> Images { get; init; } = [];
    public IReadOnlyList<ProductInventoryResponse> Inventory { get; init; } = [];
    public IReadOnlyList<ProductVendorLinkResponse> VendorLinks { get; init; } = [];
    public IReadOnlyList<ProductAttributeResponse> Attributes { get; init; } = [];
}
