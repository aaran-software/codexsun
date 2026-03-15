using cxserver.Modules.Products.Entities;
using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Analytics.Entities;

public abstract class AnalyticsEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class VendorSalesSummary : AnalyticsEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int TotalOrders { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalEarnings { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

public sealed class ProductSalesSummary : AnalyticsEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}
