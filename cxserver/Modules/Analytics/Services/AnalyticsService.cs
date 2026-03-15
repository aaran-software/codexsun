using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Analytics.DTOs;
using cxserver.Modules.Analytics.Entities;

namespace cxserver.Modules.Analytics.Services;

public sealed class AnalyticsService(CodexsunDbContext dbContext)
{
    private static readonly HashSet<string> ViewerRoles = ["Admin", "Staff", "Vendor"];

    public async Task<VendorSalesSummaryResponse?> GetVendorSalesSummaryAsync(int vendorId, Guid actorUserId, string role,
        DateTimeOffset? periodStart, DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        EnsureViewer(role);
        await EnsureVendorAccessAsync(vendorId, actorUserId, role, cancellationToken);

        var range = ResolveRange(periodStart, periodEnd);
        var vendor = await dbContext.Vendors.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == vendorId, cancellationToken);

        if (vendor is null)
        {
            return null;
        }

        var orderQuery = dbContext.VendorEarnings.AsNoTracking()
            .Where(x => x.VendorId == vendorId && x.CreatedAt >= range.Start && x.CreatedAt <= range.End);

        var totalOrders = await orderQuery.Select(x => x.OrderId).Distinct().CountAsync(cancellationToken);
        var totals = await orderQuery
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalSales = group.Sum(x => x.SaleAmount),
                TotalEarnings = group.Sum(x => x.VendorAmount)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var topProducts = await orderQuery
            .GroupBy(x => new { x.ProductId, x.Product.Name })
            .Select(group => new VendorTopProductResponse
            {
                ProductId = group.Key.ProductId,
                ProductName = group.Key.Name,
                TotalQuantity = group.Sum(x => x.OrderItem.Quantity),
                TotalRevenue = group.Sum(x => x.SaleAmount)
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(5)
            .ToListAsync(cancellationToken);

        await UpsertVendorSummaryAsync(vendorId, totalOrders, totals?.TotalSales ?? 0m, totals?.TotalEarnings ?? 0m, range.Start, range.End, cancellationToken);

        return new VendorSalesSummaryResponse
        {
            VendorId = vendor.Id,
            VendorCompanyName = vendor.CompanyName,
            TotalOrders = totalOrders,
            TotalSales = totals?.TotalSales ?? 0m,
            TotalEarnings = totals?.TotalEarnings ?? 0m,
            PeriodStart = range.Start,
            PeriodEnd = range.End,
            TopProducts = topProducts
        };
    }

    public async Task<ProductSalesSummaryResponse?> GetProductSalesSummaryAsync(int productId, DateTimeOffset? periodStart,
        DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        var range = ResolveRange(periodStart, periodEnd);
        var product = await dbContext.Products.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return null;
        }

        var totals = await dbContext.OrderItems.AsNoTracking()
            .Where(x => x.ProductId == productId && x.CreatedAt >= range.Start && x.CreatedAt <= range.End)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalQuantity = group.Sum(x => x.Quantity),
                TotalRevenue = group.Sum(x => x.TotalPrice)
            })
            .SingleOrDefaultAsync(cancellationToken);

        await UpsertProductSummaryAsync(productId, totals?.TotalQuantity ?? 0, totals?.TotalRevenue ?? 0m, range.Start, range.End, cancellationToken);

        return new ProductSalesSummaryResponse
        {
            ProductId = product.Id,
            ProductName = product.Name,
            TotalQuantity = totals?.TotalQuantity ?? 0,
            TotalRevenue = totals?.TotalRevenue ?? 0m,
            PeriodStart = range.Start,
            PeriodEnd = range.End
        };
    }

    public async Task<SalesOverviewResponse> GetSalesOverviewAsync(DateTimeOffset? periodStart, DateTimeOffset? periodEnd,
        CancellationToken cancellationToken)
    {
        var range = ResolveRange(periodStart, periodEnd);
        var orderTotals = await dbContext.Orders.AsNoTracking()
            .Where(x => x.CreatedAt >= range.Start && x.CreatedAt <= range.End)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalOrders = group.Count(),
                TotalSales = group.Sum(x => x.TotalAmount),
                TotalTax = group.Sum(x => x.TaxAmount),
                TotalDiscounts = group.Sum(x => x.DiscountAmount)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var totalVendorEarnings = await dbContext.VendorEarnings.AsNoTracking()
            .Where(x => x.CreatedAt >= range.Start && x.CreatedAt <= range.End)
            .SumAsync(x => (decimal?)x.VendorAmount, cancellationToken) ?? 0m;

        return new SalesOverviewResponse
        {
            TotalOrders = orderTotals?.TotalOrders ?? 0,
            TotalSales = orderTotals?.TotalSales ?? 0m,
            TotalTax = orderTotals?.TotalTax ?? 0m,
            TotalDiscounts = orderTotals?.TotalDiscounts ?? 0m,
            TotalVendorEarnings = totalVendorEarnings,
            PeriodStart = range.Start,
            PeriodEnd = range.End
        };
    }

    private async Task UpsertVendorSummaryAsync(int vendorId, int totalOrders, decimal totalSales, decimal totalEarnings,
        DateTimeOffset periodStart, DateTimeOffset periodEnd, CancellationToken cancellationToken)
    {
        var summary = await dbContext.VendorSalesSummaries
            .SingleOrDefaultAsync(x => x.VendorId == vendorId && x.PeriodStart == periodStart && x.PeriodEnd == periodEnd, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        if (summary is null)
        {
            dbContext.VendorSalesSummaries.Add(new VendorSalesSummary
            {
                VendorId = vendorId,
                TotalOrders = totalOrders,
                TotalSales = totalSales,
                TotalEarnings = totalEarnings,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            summary.TotalOrders = totalOrders;
            summary.TotalSales = totalSales;
            summary.TotalEarnings = totalEarnings;
            summary.UpdatedAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task UpsertProductSummaryAsync(int productId, int totalQuantity, decimal totalRevenue,
        DateTimeOffset periodStart, DateTimeOffset periodEnd, CancellationToken cancellationToken)
    {
        var summary = await dbContext.ProductSalesSummaries
            .SingleOrDefaultAsync(x => x.ProductId == productId && x.PeriodStart == periodStart && x.PeriodEnd == periodEnd, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        if (summary is null)
        {
            dbContext.ProductSalesSummaries.Add(new ProductSalesSummary
            {
                ProductId = productId,
                TotalQuantity = totalQuantity,
                TotalRevenue = totalRevenue,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            summary.TotalQuantity = totalQuantity;
            summary.TotalRevenue = totalRevenue;
            summary.UpdatedAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureVendorAccessAsync(int vendorId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (role != "Vendor")
        {
            return;
        }

        var allowed = await dbContext.VendorUsers.AnyAsync(x => x.UserId == actorUserId && x.VendorId == vendorId, cancellationToken);
        if (!allowed)
        {
            throw new InvalidOperationException("Selected vendor is outside your vendor scope.");
        }
    }

    private static (DateTimeOffset Start, DateTimeOffset End) ResolveRange(DateTimeOffset? periodStart, DateTimeOffset? periodEnd)
    {
        var end = periodEnd ?? DateTimeOffset.UtcNow;
        var start = periodStart ?? end.AddDays(-30);
        if (start > end)
        {
            throw new InvalidOperationException("The analytics date range is invalid.");
        }

        return (start, end);
    }

    private static void EnsureViewer(string role)
    {
        if (!ViewerRoles.Contains(role))
        {
            throw new InvalidOperationException("You do not have permission to view analytics.");
        }
    }
}
