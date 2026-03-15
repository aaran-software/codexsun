namespace cxserver.Modules.Shipping.DTOs;

public sealed class ShipmentItemCreateRequest
{
    public int OrderItemId { get; set; }
    public int Quantity { get; set; }
}

public sealed class ShipmentCreateRequest
{
    public int OrderId { get; set; }
    public int ShippingMethodId { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public List<ShipmentItemCreateRequest> Items { get; set; } = [];
}

public sealed class ShipmentStatusUpdateRequest
{
    public string Status { get; set; } = string.Empty;
}
