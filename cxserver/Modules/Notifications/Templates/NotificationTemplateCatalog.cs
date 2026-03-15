using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Configurations;

internal static class NotificationTemplateCatalog
{
    internal static readonly DateTimeOffset SeededAt = new(2026, 03, 15, 0, 0, 0, TimeSpan.Zero);

    public const string UserRegistration = "USER_REGISTRATION";
    public const string PasswordReset = "PASSWORD_RESET";
    public const string OrderCreated = "ORDER_CREATED";
    public const string PaymentSuccess = "PAYMENT_SUCCESS";
    public const string ShipmentShipped = "SHIPMENT_SHIPPED";
    public const string ShipmentDelivered = "SHIPMENT_DELIVERED";
    public const string ReturnApproved = "RETURN_APPROVED";
    public const string VendorPayoutCreated = "VENDOR_PAYOUT_CREATED";
    public const string LowInventoryAlert = "LOW_INVENTORY_ALERT";

    public static NotificationTemplate[] GetSeedTemplates() =>
    [
        Create(1, UserRegistration, "User Registration Email", "Email", "Welcome to Codexsun", "Hello {{Username}}, your account has been created successfully."),
        Create(2, UserRegistration, "User Registration In-App", "InApp", "Welcome", "Your account is active and ready to use."),
        Create(3, PasswordReset, "Password Reset Email", "Email", "Password Updated", "Hello {{Username}}, your password was updated on {{OccurredAt}}."),
        Create(4, OrderCreated, "Order Created Email", "Email", "Order {{OrderNumber}} created", "Your order {{OrderNumber}} has been created with total {{TotalAmount}}."),
        Create(5, PaymentSuccess, "Payment Success Email", "Email", "Payment received for {{OrderNumber}}", "We received payment {{Amount}} for order {{OrderNumber}}."),
        Create(6, ShipmentShipped, "Shipment Shipped SMS", "SMS", "Shipment shipped", "Shipment {{TrackingNumber}} for order {{OrderNumber}} has shipped."),
        Create(7, ShipmentDelivered, "Shipment Delivered WhatsApp", "WhatsApp", "Shipment delivered", "Shipment {{TrackingNumber}} for order {{OrderNumber}} was delivered."),
        Create(8, ReturnApproved, "Return Approved Email", "Email", "Return {{ReturnNumber}} approved", "Your return {{ReturnNumber}} has been approved."),
        Create(9, VendorPayoutCreated, "Vendor Payout Email", "Email", "Vendor payout {{PayoutNumber}} created", "Payout {{PayoutNumber}} for {{Amount}} is ready for processing."),
        Create(10, LowInventoryAlert, "Low Inventory In-App", "InApp", "Low inventory alert", "Product {{ProductName}} in warehouse {{WarehouseName}} is at {{QuantityOnHand}} units.")
    ];

    private static NotificationTemplate Create(int id, string code, string name, string channel, string subject, string body) =>
        new()
        {
            Id = id,
            Code = code,
            Name = name,
            Channel = channel,
            Subject = subject,
            TemplateBody = body,
            IsActive = true,
            CreatedAt = SeededAt,
            UpdatedAt = SeededAt
        };
}
