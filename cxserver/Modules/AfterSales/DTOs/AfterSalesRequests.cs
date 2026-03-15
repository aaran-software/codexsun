namespace cxserver.Modules.AfterSales.DTOs;

public sealed class CreateReturnItemRequest
{
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string ReturnReason { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
}

public sealed class CreateReturnRequest
{
    public int OrderId { get; set; }
    public int? CustomerContactId { get; set; }
    public string ReturnReason { get; set; } = string.Empty;
    public List<CreateReturnItemRequest> Items { get; set; } = [];
}

public sealed class ApproveReturnRequest
{
    public string Notes { get; set; } = string.Empty;
}

public sealed class RejectReturnRequest
{
    public string Notes { get; set; } = string.Empty;
}

public sealed class ReceiveReturnRequest
{
    public string Notes { get; set; } = string.Empty;
}

public sealed class InspectReturnItemRequest
{
    public int ReturnItemId { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool ApprovedForRefund { get; set; }
    public bool ApprovedForRestock { get; set; }
}

public sealed class InspectReturnRequest
{
    public List<InspectReturnItemRequest> Items { get; set; } = [];
}

public sealed class RestockReturnItemRequest
{
    public int ReturnItemId { get; set; }
    public int WarehouseId { get; set; }
    public int Quantity { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public sealed class RestockReturnRequest
{
    public List<RestockReturnItemRequest> Items { get; set; } = [];
}

public sealed class CompleteReturnRequest
{
    public string Notes { get; set; } = string.Empty;
}

public sealed class CreateRefundItemRequest
{
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal RefundAmount { get; set; }
}

public sealed class CreateRefundRequest
{
    public int OrderId { get; set; }
    public int? ReturnId { get; set; }
    public int? CustomerContactId { get; set; }
    public int? CurrencyId { get; set; }
    public decimal RefundAmount { get; set; }
    public string RefundMethod { get; set; } = string.Empty;
    public List<CreateRefundItemRequest> Items { get; set; } = [];
}

public sealed class ApproveRefundRequest
{
    public string Notes { get; set; } = string.Empty;
}

public sealed class ProcessRefundRequest
{
    public int ReturnId { get; set; }
    public int? WarehouseId { get; set; }
    public int? PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string Status { get; set; } = "Processed";
}

public sealed class CancelRefundRequest
{
    public string Notes { get; set; } = string.Empty;
}
