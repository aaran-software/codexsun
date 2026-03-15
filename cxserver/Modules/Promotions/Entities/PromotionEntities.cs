using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.Promotions.Entities;

public abstract class PromotionEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Promotion : PromotionEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool IsActive { get; set; }
    public ICollection<PromotionProduct> Products { get; set; } = [];
}

public sealed class PromotionProduct : PromotionEntity
{
    public int PromotionId { get; set; }
    public Promotion Promotion { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

public sealed class Coupon : PromotionEntity
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool IsActive { get; set; }
    public ICollection<CouponUsage> Usages { get; set; } = [];
}

public sealed class CouponUsage : PromotionEntity
{
    public int CouponId { get; set; }
    public Coupon Coupon { get; set; } = null!;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTimeOffset UsedAt { get; set; }
}
