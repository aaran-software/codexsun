namespace cxserver.Modules.Shipping.DTOs;

public sealed class ShippingMethodResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public decimal BaseCost { get; set; }
    public decimal CostPerKg { get; set; }
    public int EstimatedDays { get; set; }
}

public sealed class ShipmentItemResponse
{
    public int Id { get; set; }
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public sealed class ShipmentResponse
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ShippingMethodId { get; set; }
    public string ShippingMethodName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? ShippedAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public List<ShipmentItemResponse> Items { get; set; } = [];
}
