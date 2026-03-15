namespace cxserver.Modules.Inventory.DTOs;

public sealed class PurchaseOrderItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class PurchaseOrderResponse
{
    public int Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public Guid VendorUserId { get; set; }
    public int? VendorId { get; set; }
    public string VendorCompanyName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public int? CurrencyId { get; set; }
    public string CurrencyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTimeOffset? ExpectedDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<PurchaseOrderItemResponse> Items { get; set; } = [];
}

public sealed class TransferItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public sealed class TransferResponse
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public int FromWarehouseId { get; set; }
    public string FromWarehouseName { get; set; } = string.Empty;
    public int ToWarehouseId { get; set; }
    public string ToWarehouseName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public List<TransferItemResponse> Items { get; set; } = [];
}

public sealed class InventorySummaryResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int QuantityOnHand { get; set; }
    public int ReservedQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int ReorderLevel { get; set; }
}

public sealed class StockMovementResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}
