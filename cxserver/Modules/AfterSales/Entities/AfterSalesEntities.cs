using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Contacts.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.AfterSales.Entities;

public abstract class AfterSalesEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Return : AfterSalesEntity
{
    public string ReturnNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid? CustomerUserId { get; set; }
    public User? CustomerUser { get; set; }
    public int? CustomerContactId { get; set; }
    public Contact? CustomerContact { get; set; }
    public string ReturnReason { get; set; } = string.Empty;
    public string Status { get; set; } = "Requested";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? ReceivedAt { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }
    public ICollection<ReturnItem> Items { get; set; } = [];
    public ICollection<ReturnStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<Refund> Refunds { get; set; } = [];
}

public sealed class ReturnItem : AfterSalesEntity
{
    public int ReturnId { get; set; }
    public Return Return { get; set; } = null!;
    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public string ReturnReason { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
    public ICollection<ReturnInspection> Inspections { get; set; } = [];
    public ICollection<RestockEvent> RestockEvents { get; set; } = [];
    public ICollection<InventoryLedgerEntry> InventoryLedgerEntries { get; set; } = [];
}

public sealed class ReturnStatusHistory : AfterSalesEntity
{
    public int ReturnId { get; set; }
    public Return Return { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public sealed class ReturnInspection : AfterSalesEntity
{
    public int ReturnItemId { get; set; }
    public ReturnItem ReturnItem { get; set; } = null!;
    public Guid InspectorUserId { get; set; }
    public User InspectorUser { get; set; } = null!;
    public string Condition { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool ApprovedForRefund { get; set; }
    public bool ApprovedForRestock { get; set; }
}

public sealed class RestockEvent : AfterSalesEntity
{
    public int ReturnItemId { get; set; }
    public ReturnItem ReturnItem { get; set; } = null!;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public DateTimeOffset RestockedAt { get; set; }
}

public sealed class InventoryLedgerEntry : AfterSalesEntity
{
    public int ReturnItemId { get; set; }
    public ReturnItem ReturnItem { get; set; } = null!;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public int BalanceAfter { get; set; }
    public string TransactionType { get; set; } = "Return";
    public string ReferenceNo { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public sealed class Refund : AfterSalesEntity
{
    public string RefundNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int? ReturnId { get; set; }
    public Return? Return { get; set; }
    public int? CustomerContactId { get; set; }
    public Contact? CustomerContact { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public decimal RefundAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string RefundMethod { get; set; } = string.Empty;
    public DateTimeOffset? ProcessedAt { get; set; }
    public ICollection<RefundItem> Items { get; set; } = [];
    public ICollection<RefundTransaction> Transactions { get; set; } = [];
}

public sealed class RefundItem : AfterSalesEntity
{
    public int RefundId { get; set; }
    public Refund Refund { get; set; } = null!;
    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal RefundAmount { get; set; }
}

public sealed class RefundTransaction : AfterSalesEntity
{
    public int RefundId { get; set; }
    public Refund Refund { get; set; } = null!;
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }
    public decimal Amount { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public DateTimeOffset ProcessedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
