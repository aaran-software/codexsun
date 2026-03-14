namespace cxserver.Modules.Products.DTOs;

public sealed class ProductVariantRequest
{
    public string Sku { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int InventoryQuantity { get; set; }
}

public sealed class ProductPriceRequest
{
    public string PriceType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int? CurrencyId { get; set; }
}

public sealed class ProductImageRequest
{
    public string ImageUrl { get; set; } = string.Empty;
    public string AltText { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public sealed class ProductInventoryRequest
{
    public int? WarehouseId { get; set; }
    public int Quantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int ReorderLevel { get; set; }
}

public sealed class ProductVendorLinkRequest
{
    public Guid VendorUserId { get; set; }
    public string VendorSku { get; set; } = string.Empty;
    public decimal VendorSpecificPrice { get; set; }
    public int VendorInventory { get; set; }
}

public sealed class ProductAttributeValueRequest
{
    public string Value { get; set; } = string.Empty;
    public int? VariantIndex { get; set; }
}

public sealed class ProductAttributeRequest
{
    public string Name { get; set; } = string.Empty;
    public List<ProductAttributeValueRequest> Values { get; set; } = [];
}

public sealed class ProductUpsertRequest
{
    public Guid? VendorUserId { get; set; }
    public int? GroupId { get; set; }
    public int? TypeId { get; set; }
    public int? CategoryId { get; set; }
    public int? UnitId { get; set; }
    public int? CurrencyId { get; set; }
    public int? GstPercentId { get; set; }
    public int? BrandId { get; set; }
    public int? HsnCodeId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool IsPublished { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ProductVariantRequest> Variants { get; set; } = [];
    public List<ProductPriceRequest> Prices { get; set; } = [];
    public List<ProductImageRequest> Images { get; set; } = [];
    public List<ProductInventoryRequest> Inventory { get; set; } = [];
    public List<ProductVendorLinkRequest> VendorLinks { get; set; } = [];
    public List<ProductAttributeRequest> Attributes { get; set; } = [];
}

public sealed class ProductCategoryCreateRequest
{
    public string Name { get; set; } = string.Empty;
}
