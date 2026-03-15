using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Promotions.DTOs;
using cxserver.Modules.Promotions.Entities;

namespace cxserver.Modules.Promotions.Services;

public sealed class PromotionService(CodexsunDbContext dbContext)
{
    private static readonly HashSet<string> AllowedDiscountTypes = ["Percentage", "Flat"];

    public async Task<IReadOnlyList<PromotionResponse>> GetPromotionsAsync(CancellationToken cancellationToken)
        => await dbContext.Promotions.AsNoTracking()
            .Include(x => x.Products).ThenInclude(x => x.Product)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapPromotion())
            .ToListAsync(cancellationToken);

    public async Task<PromotionResponse> CreatePromotionAsync(PromotionUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateDiscount(request.DiscountType, request.DiscountValue, request.StartDate, request.EndDate);
        var productIds = request.ProductIds.Distinct().ToList();

        if (productIds.Count > 0)
        {
            var existingCount = await dbContext.Products.CountAsync(x => productIds.Contains(x.Id), cancellationToken);
            if (existingCount != productIds.Count)
            {
                throw new InvalidOperationException("One or more promotion products were not found.");
            }
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new Promotion
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            DiscountType = request.DiscountType.Trim(),
            DiscountValue = request.DiscountValue,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var productId in productIds)
        {
            entity.Products.Add(new PromotionProduct
            {
                ProductId = productId,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        dbContext.Promotions.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await GetPromotionsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<IReadOnlyList<CouponResponse>> GetCouponsAsync(CancellationToken cancellationToken)
        => await dbContext.Coupons.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CouponResponse
            {
                Id = x.Id,
                Code = x.Code,
                DiscountType = x.DiscountType,
                DiscountValue = x.DiscountValue,
                UsageLimit = x.UsageLimit,
                UsedCount = x.UsedCount,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);

    public async Task<CouponResponse> CreateCouponAsync(CouponUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateDiscount(request.DiscountType, request.DiscountValue, request.StartDate, request.EndDate);
        if (request.UsageLimit <= 0)
        {
            throw new InvalidOperationException("Coupon usage limit must be greater than zero.");
        }

        var code = request.Code.Trim().ToUpperInvariant();
        if (await dbContext.Coupons.AnyAsync(x => x.Code == code, cancellationToken))
        {
            throw new InvalidOperationException("Coupon code already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new Coupon
        {
            Code = code,
            DiscountType = request.DiscountType.Trim(),
            DiscountValue = request.DiscountValue,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Coupons.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await GetCouponsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CouponValidationResponse> ValidateCouponAsync(ValidateCouponRequest request, Guid actorUserId, CancellationToken cancellationToken)
    {
        var coupon = await ResolveCouponAsync(request.Code, cancellationToken);
        if (coupon is null)
        {
            return InvalidCoupon("Coupon was not found.");
        }

        if (coupon.UsedCount >= coupon.UsageLimit)
        {
            return InvalidCoupon("Coupon usage limit has been reached.", coupon.Code);
        }

        var now = DateTimeOffset.UtcNow;
        if (!coupon.IsActive || coupon.StartDate > now || coupon.EndDate < now)
        {
            return InvalidCoupon("Coupon is not active.", coupon.Code);
        }

        if (request.OrderId.HasValue)
        {
            if (await dbContext.CouponUsages.AnyAsync(x => x.CouponId == coupon.Id && x.OrderId == request.OrderId.Value, cancellationToken))
            {
                return InvalidCoupon("Coupon was already applied to this order.", coupon.Code);
            }

            var orderExists = await dbContext.Orders.AnyAsync(x => x.Id == request.OrderId.Value, cancellationToken);
            if (!orderExists)
            {
                return InvalidCoupon("Order was not found.", coupon.Code);
            }
        }

        var discount = CalculateDiscount(coupon.DiscountType, coupon.DiscountValue, request.Amount);
        return new CouponValidationResponse
        {
            IsValid = true,
            Message = "Coupon is valid.",
            Code = coupon.Code,
            DiscountAmount = discount,
            FinalAmount = Math.Max(0, request.Amount - discount)
        };
    }

    public async Task<CouponValidationResponse> ApplyCouponAsync(ApplyCouponRequest request, Guid actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders.SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken)
            ?? throw new InvalidOperationException("Order was not found.");

        var validation = await ValidateCouponAsync(new ValidateCouponRequest
        {
            Code = request.Code,
            OrderId = request.OrderId,
            Amount = order.TotalAmount
        }, actorUserId, cancellationToken);

        if (!validation.IsValid)
        {
            throw new InvalidOperationException(validation.Message);
        }

        var coupon = await ResolveCouponAsync(request.Code, cancellationToken)
            ?? throw new InvalidOperationException("Coupon was not found.");

        var now = DateTimeOffset.UtcNow;
        coupon.UsedCount += 1;
        coupon.UpdatedAt = now;
        order.DiscountAmount += validation.DiscountAmount;
        order.TotalAmount = Math.Max(0, order.TotalAmount - validation.DiscountAmount);
        order.UpdatedAt = now;

        dbContext.CouponUsages.Add(new CouponUsage
        {
            CouponId = coupon.Id,
            OrderId = order.Id,
            UserId = actorUserId,
            UsedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Promotion.CouponApply", nameof(CouponUsage), order.Id.ToString(), ipAddress, cancellationToken);
        return validation;
    }

    public decimal CalculatePromotionDiscount(string discountType, decimal discountValue, decimal amount)
        => CalculateDiscount(discountType, discountValue, amount);

    private async Task<Coupon?> ResolveCouponAsync(string code, CancellationToken cancellationToken)
        => await dbContext.Coupons.SingleOrDefaultAsync(x => x.Code == code.Trim().ToUpperInvariant(), cancellationToken);

    private static void ValidateDiscount(string discountType, decimal discountValue, DateTimeOffset startDate, DateTimeOffset endDate)
    {
        if (!AllowedDiscountTypes.Contains(discountType))
        {
            throw new InvalidOperationException("Unsupported discount type.");
        }

        if (discountValue <= 0)
        {
            throw new InvalidOperationException("Discount value must be greater than zero.");
        }

        if (startDate > endDate)
        {
            throw new InvalidOperationException("The promotion date range is invalid.");
        }
    }

    private static decimal CalculateDiscount(string discountType, decimal discountValue, decimal amount)
        => discountType switch
        {
            "Percentage" => Math.Round(amount * (discountValue / 100m), 2, MidpointRounding.AwayFromZero),
            "Flat" => Math.Min(amount, discountValue),
            _ => throw new InvalidOperationException("Unsupported discount type.")
        };

    private static CouponValidationResponse InvalidCoupon(string message, string code = "")
        => new()
        {
            IsValid = false,
            Message = message,
            Code = code,
            DiscountAmount = 0,
            FinalAmount = 0
        };

    private static global::System.Linq.Expressions.Expression<Func<Promotion, PromotionResponse>> MapPromotion()
    {
        return x => new PromotionResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            DiscountType = x.DiscountType,
            DiscountValue = x.DiscountValue,
            StartDate = x.StartDate,
            EndDate = x.EndDate,
            IsActive = x.IsActive,
            Products = x.Products.Select(product => new PromotionProductResponse
            {
                ProductId = product.ProductId,
                ProductName = product.Product.Name
            }).ToList()
        };
    }

    private async Task WriteAuditLogAsync(Guid? userId, string action, string entityType, string? entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Module = "Promotions",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
