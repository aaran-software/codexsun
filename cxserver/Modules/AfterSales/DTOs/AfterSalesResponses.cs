namespace cxserver.Modules.AfterSales.DTOs;

public sealed class ReturnStatusHistoryResponse
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class ReturnInspectionResponse
{
    public int Id { get; set; }
    public int ReturnItemId { get; set; }
    public Guid InspectorUserId { get; set; }
    public string InspectorName { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool ApprovedForRefund { get; set; }
    public bool ApprovedForRestock { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class RestockEventResponse
{
    public int Id { get; set; }
    public int ReturnItemId { get; set; }
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTimeOffset RestockedAt { get; set; }
}

public sealed class InventoryLedgerEntryResponse
{
    public int Id { get; set; }
    public int ReturnItemId { get; set; }
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int BalanceAfter { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public string ReferenceNo { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class ReturnItemResponse
{
    public int Id { get; set; }
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string ReturnReason { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
    public List<ReturnInspectionResponse> Inspections { get; set; } = [];
    public List<RestockEventResponse> RestockEvents { get; set; } = [];
}

public class ReturnSummaryResponse
{
    public int Id { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int? CustomerContactId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string ReturnReason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? ReceivedAt { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public int ItemCount { get; set; }
}

public sealed class ReturnDetailResponse : ReturnSummaryResponse
{
    public List<ReturnItemResponse> Items { get; set; } = [];
    public List<ReturnStatusHistoryResponse> StatusHistory { get; set; } = [];
    public List<InventoryLedgerEntryResponse> InventoryLedger { get; set; } = [];
}

public sealed class RefundTransactionResponse
{
    public int Id { get; set; }
    public int? PaymentId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public DateTimeOffset ProcessedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public sealed class RefundItemResponse
{
    public int Id { get; set; }
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal RefundAmount { get; set; }
}

public class RefundSummaryResponse
{
    public int Id { get; set; }
    public string RefundNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int? ReturnId { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public int? CustomerContactId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public decimal RefundAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string RefundMethod { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
}

public sealed class RefundDetailResponse : RefundSummaryResponse
{
    public List<RefundItemResponse> Items { get; set; } = [];
    public List<RefundTransactionResponse> Transactions { get; set; } = [];
}
