namespace cxserver.Modules.Analytics.DTOs;

public sealed class VendorTopProductResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public sealed class VendorSalesSummaryResponse
{
    public int VendorId { get; set; }
    public string VendorCompanyName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalEarnings { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public List<VendorTopProductResponse> TopProducts { get; set; } = [];
}

public sealed class ProductSalesSummaryResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

public sealed class SalesOverviewResponse
{
    public int TotalOrders { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalVendorEarnings { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}
