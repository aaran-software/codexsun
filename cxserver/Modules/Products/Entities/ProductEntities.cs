using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Products.Entities;

public abstract class ProductEntity
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ProductCategory : ProductEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = [];
}

public sealed class Product : ProductEntity
{
    public Guid OwnerUserId { get; set; }
    public User OwnerUser { get; set; } = null!;
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
    public int? GroupId { get; set; }
    public ProductGroup? Group { get; set; }
    public int? TypeId { get; set; }
    public ProductType? Type { get; set; }
    public int? CategoryId { get; set; }
    public ProductCategory? Category { get; set; }
    public int? UnitId { get; set; }
    public Unit? Unit { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public int? GstPercentId { get; set; }
    public GstPercent? GstPercent { get; set; }
    public int? BrandId { get; set; }
    public Brand? Brand { get; set; }
    public int? HsnCodeId { get; set; }
    public HsnCode? HsnCode { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool IsPublished { get; set; }
    public ICollection<ProductVariant> Variants { get; set; } = [];
    public ICollection<ProductPrice> Prices { get; set; } = [];
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<ProductInventory> Inventory { get; set; } = [];
    public ICollection<ProductVendorLink> VendorLinks { get; set; } = [];
    public ICollection<ProductAttribute> Attributes { get; set; } = [];
}

public sealed class ProductVariant : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Sku { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int InventoryQuantity { get; set; }
    public ICollection<ProductAttributeValue> AttributeValues { get; set; } = [];
}

public sealed class ProductPrice : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string PriceType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
}

public sealed class ProductImage : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public string AltText { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public sealed class ProductInventory : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int Quantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int ReorderLevel { get; set; }
}

public sealed class ProductVendorLink : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid VendorUserId { get; set; }
    public User VendorUser { get; set; } = null!;
    public string VendorSku { get; set; } = string.Empty;
    public decimal VendorSpecificPrice { get; set; }
    public int VendorInventory { get; set; }
}

public sealed class ProductAttribute : ProductEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public ICollection<ProductAttributeValue> Values { get; set; } = [];
}

public sealed class ProductAttributeValue : ProductEntity
{
    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public string Value { get; set; } = string.Empty;
}
