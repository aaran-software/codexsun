namespace cxserver.Modules.Inventory.DTOs;

public sealed class PurchaseOrderCreateItemRequest
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public sealed class PurchaseOrderCreateRequest
{
    public Guid VendorUserId { get; set; }
    public int? CurrencyId { get; set; }
    public DateTimeOffset? ExpectedDate { get; set; }
    public List<PurchaseOrderCreateItemRequest> Items { get; set; } = [];
}

public sealed class PurchaseOrderReceiveRequest
{
    public int WarehouseId { get; set; }
}

public sealed class TransferCreateItemRequest
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

public sealed class TransferCreateRequest
{
    public int FromWarehouseId { get; set; }
    public int ToWarehouseId { get; set; }
    public List<TransferCreateItemRequest> Items { get; set; } = [];
}

public sealed class InventoryAdjustmentItemRequest
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int NewQuantity { get; set; }
}

public sealed class InventoryAdjustmentRequest
{
    public int WarehouseId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public List<InventoryAdjustmentItemRequest> Items { get; set; } = [];
}
