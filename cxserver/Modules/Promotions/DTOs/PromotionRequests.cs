namespace cxserver.Modules.Promotions.DTOs;

public sealed class PromotionUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public List<int> ProductIds { get; set; } = [];
}

public sealed class CouponUpsertRequest
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public int UsageLimit { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public decimal Amount { get; set; }
}

public sealed class ApplyCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public int OrderId { get; set; }
}
