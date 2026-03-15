using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.AfterSales.DTOs;
using cxserver.Modules.AfterSales.Entities;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.AfterSales.Services;

public sealed partial class AfterSalesService(CodexsunDbContext dbContext, NotificationService notificationService)
{
    private static readonly HashSet<string> AllowedReturnStatuses =
    [
        "Requested", "Approved", "Rejected", "InTransit", "Received", "Inspected", "Completed", "Cancelled"
    ];

    private static readonly HashSet<string> AllowedResolutionTypes =
    [
        "Refund", "Replacement", "StoreCredit", "Repair"
    ];

    public async Task<IReadOnlyList<ReturnSummaryResponse>> GetReturnsAsync(Guid actorUserId, string role,
        CancellationToken cancellationToken)
    {
        var entities = await BuildVisibleReturnsQuery(actorUserId, role)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapReturnSummary).ToList();
    }

    public async Task<ReturnDetailResponse?> GetReturnByIdAsync(int returnId, Guid actorUserId, string role,
        CancellationToken cancellationToken)
    {
        var entity = await BuildVisibleReturnsQuery(actorUserId, role)
            .SingleOrDefaultAsync(x => x.Id == returnId, cancellationToken);

        return entity is null ? null : MapReturnDetail(entity);
    }

    public async Task<ReturnDetailResponse> CreateReturnRequestAsync(CreateReturnRequest request, Guid actorUserId,
        string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one return item is required.");
        }

        var order = await dbContext.Orders
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.CustomerContact)
            .SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Order was not found.");
        }

        var orderItems = order.Items.ToDictionary(x => x.Id);
        var now = DateTimeOffset.UtcNow;
        var entity = new Return
        {
            ReturnNumber = await GenerateDocumentNumberAsync("RTN", dbContext.Returns.Select(x => x.ReturnNumber),
                cancellationToken),
            OrderId = order.Id,
            CustomerUserId = order.CustomerUserId,
            CustomerContactId = request.CustomerContactId ?? order.CustomerContactId,
            ReturnReason = request.ReturnReason.Trim(),
            Status = "Requested",
            RequestedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in request.Items)
        {
            if (!orderItems.TryGetValue(item.OrderItemId, out var orderItem))
            {
                throw new InvalidOperationException(
                    $"Order item {item.OrderItemId} was not found for the selected order.");
            }

            if (role == "Vendor" && orderItem.VendorUserId != actorUserId)
            {
                throw new InvalidOperationException("Vendor users can only return their own order items.");
            }

            if (item.ProductId != orderItem.ProductId)
            {
                throw new InvalidOperationException("Return item product does not match the order item.");
            }

            if (item.Quantity <= 0 || item.Quantity > orderItem.Quantity)
            {
                throw new InvalidOperationException("Return quantity must be between 1 and the ordered quantity.");
            }

            ValidateResolutionType(item.ResolutionType);

            entity.Items.Add(new ReturnItem
            {
                OrderItemId = orderItem.Id,
                ProductId = orderItem.ProductId,
                Quantity = item.Quantity,
                ReturnReason = item.ReturnReason.Trim(),
                Condition = item.Condition.Trim(),
                ResolutionType = item.ResolutionType.Trim(),
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        entity.StatusHistory.Add(new ReturnStatusHistory
        {
            Status = entity.Status,
            Notes = "Return requested",
            CreatedAt = now,
            UpdatedAt = now
        });

        dbContext.Returns.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Return.Create", nameof(Return), entity.Id.ToString(), ipAddress,
            cancellationToken);
        return (await GetReturnByIdAsync(entity.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<ReturnDetailResponse?> ApproveReturnAsync(int returnId, ApproveReturnRequest request,
        Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (!CanManageAfterSales(role))
        {
            return null;
        }

        var entity = await LoadReturnForUpdateAsync(returnId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        EnsureReturnStatus(entity.Status, "Requested");
        var now = DateTimeOffset.UtcNow;
        entity.Status = "Approved";
        entity.ApprovedAt = now;
        entity.UpdatedAt = now;
        entity.StatusHistory.Add(new ReturnStatusHistory
        {
            Status = entity.Status,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? "Return approved" : request.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Return.Approve", nameof(Return), entity.Id.ToString(), ipAddress,
            cancellationToken);
        await notificationService.QueueEventAsync(NotificationTemplateCatalog.ReturnApproved, entity.CustomerUserId, new Dictionary<string, string>
        {
            ["ReturnId"] = entity.Id.ToString(),
            ["ReturnNumber"] = entity.ReturnNumber,
            ["OccurredAt"] = now.ToString("O")
        }, cancellationToken);
        return await GetReturnByIdAsync(entity.Id, actorUserId, role, cancellationToken);
    }

    public async Task<ReturnDetailResponse?> RejectReturnAsync(int returnId, RejectReturnRequest request,
        Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (!CanManageAfterSales(role))
        {
            return null;
        }

        var entity = await LoadReturnForUpdateAsync(returnId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        EnsureReturnStatus(entity.Status, "Requested");
        var now = DateTimeOffset.UtcNow;
        entity.Status = "Rejected";
        entity.ClosedAt = now;
        entity.UpdatedAt = now;
        entity.StatusHistory.Add(new ReturnStatusHistory
        {
            Status = entity.Status,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? "Return rejected" : request.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Return.Reject", nameof(Return), entity.Id.ToString(), ipAddress,
            cancellationToken);
        return await GetReturnByIdAsync(entity.Id, actorUserId, role, cancellationToken);
    }
}
