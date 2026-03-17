using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Contacts.Entities;
using cxserver.Modules.Finance.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Sales.Entities;

public abstract class SalesEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Cart : SalesEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public ICollection<CartItem> Items { get; set; } = [];
}

public sealed class CartItem : SalesEntity
{
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
}

public sealed class Order : SalesEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string PaymentProvider { get; set; } = string.Empty;
    public string PaymentGatewayOrderId { get; set; } = string.Empty;
    public Guid? CustomerUserId { get; set; }
    public User? CustomerUser { get; set; }
    public int? CustomerContactId { get; set; }
    public Contact? CustomerContact { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string ShippingMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = "Pending";
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = "Pending";
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<OrderAddress> Addresses { get; set; } = [];
    public ICollection<Invoice> Invoices { get; set; } = [];
}

public sealed class OrderItem : SalesEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public ICollection<VendorEarning> VendorEarnings { get; set; } = [];
    public ICollection<OrderInventoryReservation> InventoryReservations { get; set; } = [];
}

public sealed class OrderStatusHistory : SalesEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public sealed class OrderAddress : SalesEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int? ContactId { get; set; }
    public Contact? Contact { get; set; }
    public string AddressType { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}

public sealed class Invoice : SalesEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public int? CustomerContactId { get; set; }
    public Contact? CustomerContact { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Draft";
    public DateTimeOffset IssuedDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public ICollection<InvoiceItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}

public sealed class InvoiceItem : SalesEntity
{
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class Payment : SalesEntity
{
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public int? PaymentModeId { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public decimal Amount { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string Status { get; set; } = "Pending";
    public string TransactionReference { get; set; } = string.Empty;
    public DateTimeOffset? PaidAt { get; set; }
    public ICollection<PaymentTransaction> Transactions { get; set; } = [];
}

public sealed class PaymentTransaction : SalesEntity
{
    public int PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public sealed class OrderInventoryReservation : SalesEntity
{
    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public int? ProductInventoryId { get; set; }
    public ProductInventory? ProductInventory { get; set; }
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
    public int Quantity { get; set; }
    public int ReleasedQuantity { get; set; }
}

public sealed class VendorEarning : SalesEntity
{
    public Guid VendorUserId { get; set; }
    public User VendorUser { get; set; } = null!;
    public int? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public decimal SaleAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal VendorAmount { get; set; }
    public bool IsSettled { get; set; }
    public ICollection<VendorPayoutItem> PayoutItems { get; set; } = [];
}

public sealed class VendorPayout : SalesEntity
{
    public Guid VendorUserId { get; set; }
    public User VendorUser { get; set; } = null!;
    public int? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public string PayoutNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public ICollection<VendorPayoutItem> Items { get; set; } = [];
}

public sealed class VendorPayoutItem : SalesEntity
{
    public int VendorPayoutId { get; set; }
    public VendorPayout VendorPayout { get; set; } = null!;
    public int VendorEarningId { get; set; }
    public VendorEarning VendorEarning { get; set; } = null!;
    public decimal Amount { get; set; }
}
