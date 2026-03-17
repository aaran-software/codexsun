namespace cxserver.Modules.Sales.DTOs;

public sealed class CartItemUpsertRequest
{
    public string SessionId { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public Guid? VendorUserId { get; set; }
    public int? CurrencyId { get; set; }
}

public sealed class CartItemUpdateRequest
{
    public int Quantity { get; set; }
}

public sealed class OrderAddressRequest
{
    public int? ContactId { get; set; }
    public string AddressType { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}

public sealed class CreateOrderRequest
{
    public int? CartId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public int? CustomerContactId { get; set; }
    public int? CurrencyId { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTimeOffset? InvoiceDueDate { get; set; }
    public string ShippingMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public OrderAddressRequest BillingAddress { get; set; } = new();
    public OrderAddressRequest ShippingAddress { get; set; } = new();
}

public sealed class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public sealed class CreateInvoiceRequest
{
    public int OrderId { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public sealed class RecordPaymentRequest
{
    public int InvoiceId { get; set; }
    public int? PaymentModeId { get; set; }
    public decimal Amount { get; set; }
    public int? CurrencyId { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
}

public sealed class InitializeRazorpayCheckoutRequest
{
    public int OrderId { get; set; }
}

public sealed class VerifyRazorpayPaymentRequest
{
    public int OrderId { get; set; }
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpayPaymentId { get; set; } = string.Empty;
    public string RazorpaySignature { get; set; } = string.Empty;
}

public sealed class RefundPaymentRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class CreateVendorPayoutRequest
{
    public Guid? VendorUserId { get; set; }
    public int? CurrencyId { get; set; }
}

public sealed class ApproveVendorPayoutRequest
{
    public bool MarkAsPaid { get; set; }
}
