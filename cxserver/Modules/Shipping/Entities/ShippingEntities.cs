using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.Shipping.Entities;

public abstract class ShippingEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ShippingProvider : ShippingEntity
{
    public string Name { get; set; } = string.Empty;
    public string TrackingUrl { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public ICollection<ShippingMethod> Methods { get; set; } = [];
}

public sealed class ShippingMethod : ShippingEntity
{
    public string Name { get; set; } = string.Empty;
    public int ProviderId { get; set; }
    public ShippingProvider Provider { get; set; } = null!;
    public decimal BaseCost { get; set; }
    public decimal CostPerKg { get; set; }
    public int EstimatedDays { get; set; }
    public ICollection<Shipment> Shipments { get; set; } = [];
}

public sealed class Shipment : ShippingEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ShippingMethodId { get; set; }
    public ShippingMethod ShippingMethod { get; set; } = null!;
    public string TrackingNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTimeOffset? ShippedAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public ICollection<ShipmentItem> Items { get; set; } = [];
}

public sealed class ShipmentItem : ShippingEntity
{
    public int ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;
    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public int Quantity { get; set; }
}
