namespace cxserver.Modules.Sales.DTOs;

public sealed class CartItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public Guid? VendorUserId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class CartResponse
{
    public int Id { get; set; }
    public Guid? UserId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public int? CurrencyId { get; set; }
    public string CurrencyName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public int TotalItems { get; set; }
    public List<CartItemResponse> Items { get; set; } = [];
}

public class OrderSummaryResponse
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string ShippingMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public int? CustomerContactId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class OrderItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string ProductVariantName { get; set; } = string.Empty;
    public Guid? VendorUserId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class OrderStatusHistoryResponse
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class OrderAddressResponse
{
    public int Id { get; set; }
    public int? ContactId { get; set; }
    public string AddressType { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}

public sealed class OrderDetailResponse : OrderSummaryResponse
{
    public List<OrderItemResponse> Items { get; set; } = [];
    public List<OrderStatusHistoryResponse> StatusHistory { get; set; } = [];
    public List<OrderAddressResponse> Addresses { get; set; } = [];
}

public class InvoiceSummaryResponse
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int? CustomerContactId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset IssuedDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public sealed class InvoiceItemResponse
{
    public int Id { get; set; }
    public int? ProductId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class InvoiceDetailResponse : InvoiceSummaryResponse
{
    public List<InvoiceItemResponse> Items { get; set; } = [];
}

public sealed class PaymentSummaryResponse
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string PaymentMethodName { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string TransactionReference { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class RazorpayCheckoutSessionResponse
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string KeyId { get; set; } = string.Empty;
    public string RazorpayOrderId { get; set; } = string.Empty;
    public int AmountInSubunits { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string MerchantName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string ThemeColor { get; set; } = string.Empty;
}

public sealed class RazorpayPaymentVerificationResponse
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public PaymentSummaryResponse Payment { get; set; } = new();
}

public sealed class VendorEarningResponse
{
    public int Id { get; set; }
    public int? VendorId { get; set; }
    public string VendorCompanyName { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal SaleAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal VendorAmount { get; set; }
    public bool IsSettled { get; set; }
}

public sealed class VendorPayoutSummaryResponse
{
    public int Id { get; set; }
    public Guid VendorUserId { get; set; }
    public int? VendorId { get; set; }
    public string VendorCompanyName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string PayoutNumber { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public List<VendorEarningResponse> Earnings { get; set; } = [];
}
