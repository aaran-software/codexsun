using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Inventory.Entities;

public abstract class InventoryEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class InventoryLedger : InventoryEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public int QuantityIn { get; set; }
    public int QuantityOut { get; set; }
    public int BalanceAfter { get; set; }
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}

public sealed class PurchaseOrder : InventoryEntity
{
    public string PoNumber { get; set; } = string.Empty;
    public Guid VendorUserId { get; set; }
    public User VendorUser { get; set; } = null!;
    public int? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTimeOffset? ExpectedDate { get; set; }
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<PurchaseOrderItem> Items { get; set; } = [];
}

public sealed class PurchaseOrderItem : InventoryEntity
{
    public int PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class StockMovement : InventoryEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}

public sealed class WarehouseTransfer : InventoryEntity
{
    public string TransferNumber { get; set; } = string.Empty;
    public int FromWarehouseId { get; set; }
    public Warehouse FromWarehouse { get; set; } = null!;
    public int ToWarehouseId { get; set; }
    public Warehouse ToWarehouse { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<WarehouseTransferItem> Items { get; set; } = [];
}

public sealed class WarehouseTransferItem : InventoryEntity
{
    public int TransferId { get; set; }
    public WarehouseTransfer Transfer { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int Quantity { get; set; }
}

public sealed class InventoryAdjustment : InventoryEntity
{
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string Reason { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<InventoryAdjustmentItem> Items { get; set; } = [];
}

public sealed class InventoryAdjustmentItem : InventoryEntity
{
    public int AdjustmentId { get; set; }
    public InventoryAdjustment Adjustment { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int OldQuantity { get; set; }
    public int NewQuantity { get; set; }
    public int Difference { get; set; }
}
