using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.AfterSales.DTOs;
using cxserver.Modules.AfterSales.Entities;
using cxserver.Modules.Auth.Entities;

namespace cxserver.Modules.AfterSales.Services;

public sealed partial class AfterSalesService
{
    public async Task<IReadOnlyList<RefundSummaryResponse>> GetRefundsAsync(CancellationToken cancellationToken)
    {
        var entities = await dbContext.Refunds.AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.Return)
            .Include(x => x.CustomerContact)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Transactions).ThenInclude(x => x.Payment)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapRefundSummary).ToList();
    }

    public async Task<RefundDetailResponse?> ProcessRefundAsync(ProcessRefundRequest request, Guid actorUserId, string role,
        string ipAddress, CancellationToken cancellationToken)
    {
        if (!CanManageAfterSales(role))
        {
            return null;
        }

        var entity = await LoadReturnForUpdateAsync(request.ReturnId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        EnsureReturnStatus(entity.Status, "Approved");

        var now = DateTimeOffset.UtcNow;
        var refundAmount = request.Amount > 0 ? request.Amount : CalculateRefundAmount(entity);
        var refund = new Refund
        {
            RefundNumber = await GenerateDocumentNumberAsync("RFD", dbContext.Refunds.Select(x => x.RefundNumber), cancellationToken),
            OrderId = entity.OrderId,
            ReturnId = entity.Id,
            CustomerContactId = entity.CustomerContactId,
            CurrencyId = entity.Order.CurrencyId,
            RefundAmount = refundAmount,
            Status = request.Status.Trim(),
            RefundMethod = request.PaymentId.HasValue ? "OriginalPayment" : "Manual",
            ProcessedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in entity.Items)
        {
            var orderItem = await dbContext.OrderItems.SingleAsync(x => x.Id == item.OrderItemId, cancellationToken);
            refund.Items.Add(new RefundItem
            {
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                RefundAmount = Math.Round((orderItem.TotalPrice / Math.Max(1, orderItem.Quantity)) * item.Quantity, 2, MidpointRounding.AwayFromZero),
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        refund.Transactions.Add(new RefundTransaction
        {
            PaymentId = request.PaymentId,
            Amount = refundAmount,
            TransactionReference = request.TransactionReference.Trim(),
            ProcessedAt = now,
            Status = request.Status.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });

        dbContext.Refunds.Add(refund);

        if (request.WarehouseId.HasValue)
        {
            await RestockReturnedItemsAsync(entity, request.WarehouseId.Value, now, cancellationToken);
            entity.ReceivedAt = now;
        }

        entity.Status = "Completed";
        entity.ClosedAt = now;
        entity.UpdatedAt = now;
        entity.StatusHistory.Add(new ReturnStatusHistory
        {
            Status = entity.Status,
            Notes = "Refund processed",
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Refund.Process", nameof(Refund), refund.Id.ToString(), ipAddress, cancellationToken);
        return await GetRefundByIdAsync(refund.Id, cancellationToken);
    }

    private async Task<RefundDetailResponse?> GetRefundByIdAsync(int refundId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Refunds.AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.Return)
            .Include(x => x.CustomerContact)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Transactions).ThenInclude(x => x.Payment)
            .SingleOrDefaultAsync(x => x.Id == refundId, cancellationToken);

        return entity is null ? null : MapRefundDetail(entity);
    }

    private IQueryable<Return> BuildVisibleReturnsQuery(Guid actorUserId, string role)
    {
        var query = dbContext.Returns
            .AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.CustomerContact)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.Inspections).ThenInclude(x => x.InspectorUser)
            .Include(x => x.Items).ThenInclude(x => x.RestockEvents).ThenInclude(x => x.Warehouse)
            .Include(x => x.StatusHistory)
            .Include(x => x.Refunds)
            .AsQueryable();

        if (role is "Admin" or "Staff")
        {
            return query;
        }

        if (role == "Vendor")
        {
            return query.Where(x => x.Items.Any(item => item.OrderItem.VendorUserId == actorUserId));
        }

        return query.Where(x => x.CustomerUserId == actorUserId || x.Order.CustomerUserId == actorUserId);
    }

    private static ReturnSummaryResponse MapReturnSummary(Return entity)
        => new()
        {
            Id = entity.Id,
            ReturnNumber = entity.ReturnNumber,
            OrderId = entity.OrderId,
            OrderNumber = entity.Order.OrderNumber,
            CustomerContactId = entity.CustomerContactId,
            CustomerName = entity.CustomerContact?.DisplayName ?? string.Empty,
            ReturnReason = entity.ReturnReason,
            Status = entity.Status,
            RequestedAt = entity.RequestedAt,
            ApprovedAt = entity.ApprovedAt,
            ReceivedAt = entity.ReceivedAt,
            ClosedAt = entity.ClosedAt,
            CreatedAt = entity.CreatedAt,
            ItemCount = entity.Items.Count
        };

    private static ReturnDetailResponse MapReturnDetail(Return entity)
        => new()
        {
            Id = entity.Id,
            ReturnNumber = entity.ReturnNumber,
            OrderId = entity.OrderId,
            OrderNumber = entity.Order.OrderNumber,
            CustomerContactId = entity.CustomerContactId,
            CustomerName = entity.CustomerContact?.DisplayName ?? string.Empty,
            ReturnReason = entity.ReturnReason,
            Status = entity.Status,
            RequestedAt = entity.RequestedAt,
            ApprovedAt = entity.ApprovedAt,
            ReceivedAt = entity.ReceivedAt,
            ClosedAt = entity.ClosedAt,
            CreatedAt = entity.CreatedAt,
            ItemCount = entity.Items.Count,
            Items = entity.Items.Select(item => new ReturnItemResponse
            {
                Id = item.Id,
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductSku = item.Product.Sku,
                Quantity = item.Quantity,
                ReturnReason = item.ReturnReason,
                Condition = item.Condition,
                ResolutionType = item.ResolutionType,
                Inspections = item.Inspections.Select(inspection => new ReturnInspectionResponse
                {
                    Id = inspection.Id,
                    ReturnItemId = inspection.ReturnItemId,
                    InspectorUserId = inspection.InspectorUserId,
                    InspectorName = inspection.InspectorUser.Username,
                    Condition = inspection.Condition,
                    Notes = inspection.Notes,
                    ApprovedForRefund = inspection.ApprovedForRefund,
                    ApprovedForRestock = inspection.ApprovedForRestock,
                    CreatedAt = inspection.CreatedAt
                }).ToList(),
                RestockEvents = item.RestockEvents.Select(restock => new RestockEventResponse
                {
                    Id = restock.Id,
                    ReturnItemId = restock.ReturnItemId,
                    WarehouseId = restock.WarehouseId,
                    WarehouseName = restock.Warehouse.Name,
                    ProductId = restock.ProductId,
                    ProductName = restock.Product.Name,
                    Quantity = restock.Quantity,
                    RestockedAt = restock.RestockedAt
                }).ToList()
            }).ToList(),
            StatusHistory = entity.StatusHistory
                .OrderBy(x => x.CreatedAt)
                .Select(history => new ReturnStatusHistoryResponse
                {
                    Id = history.Id,
                    Status = history.Status,
                    Notes = history.Notes,
                    CreatedAt = history.CreatedAt
                }).ToList()
        };

    private static RefundSummaryResponse MapRefundSummary(Refund entity)
        => new()
        {
            Id = entity.Id,
            RefundNumber = entity.RefundNumber,
            OrderId = entity.OrderId,
            OrderNumber = entity.Order.OrderNumber,
            ReturnId = entity.ReturnId,
            ReturnNumber = entity.Return?.ReturnNumber ?? string.Empty,
            CustomerContactId = entity.CustomerContactId,
            CustomerName = entity.CustomerContact?.DisplayName ?? string.Empty,
            CurrencyName = entity.Currency?.Name ?? string.Empty,
            RefundAmount = entity.RefundAmount,
            Status = entity.Status,
            RefundMethod = entity.RefundMethod,
            CreatedAt = entity.CreatedAt,
            ProcessedAt = entity.ProcessedAt
        };

    private static RefundDetailResponse MapRefundDetail(Refund entity)
        => new()
        {
            Id = entity.Id,
            RefundNumber = entity.RefundNumber,
            OrderId = entity.OrderId,
            OrderNumber = entity.Order.OrderNumber,
            ReturnId = entity.ReturnId,
            ReturnNumber = entity.Return?.ReturnNumber ?? string.Empty,
            CustomerContactId = entity.CustomerContactId,
            CustomerName = entity.CustomerContact?.DisplayName ?? string.Empty,
            CurrencyName = entity.Currency?.Name ?? string.Empty,
            RefundAmount = entity.RefundAmount,
            Status = entity.Status,
            RefundMethod = entity.RefundMethod,
            CreatedAt = entity.CreatedAt,
            ProcessedAt = entity.ProcessedAt,
            Items = entity.Items.Select(item => new RefundItemResponse
            {
                Id = item.Id,
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductSku = item.Product.Sku,
                Quantity = item.Quantity,
                RefundAmount = item.RefundAmount
            }).ToList(),
            Transactions = entity.Transactions.Select(transaction => new RefundTransactionResponse
            {
                Id = transaction.Id,
                PaymentId = transaction.PaymentId,
                PaymentReference = transaction.Payment != null ? transaction.Payment.TransactionReference : string.Empty,
                Amount = transaction.Amount,
                TransactionReference = transaction.TransactionReference,
                ProcessedAt = transaction.ProcessedAt,
                Status = transaction.Status
            }).ToList()
        };

    private async Task<Return?> LoadReturnForUpdateAsync(int returnId, CancellationToken cancellationToken)
        => await dbContext.Returns
            .Include(x => x.Order)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.StatusHistory)
            .SingleOrDefaultAsync(x => x.Id == returnId, cancellationToken);

    private async Task<bool> CanAccessOrderAsync(global::cxserver.Modules.Sales.Entities.Order order, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (role is "Admin" or "Staff")
        {
            return true;
        }

        if (role == "Vendor")
        {
            return await dbContext.OrderItems.AnyAsync(x => x.OrderId == order.Id && x.VendorUserId == actorUserId, cancellationToken);
        }

        return order.CustomerUserId == actorUserId;
    }

    private static void ValidateResolutionType(string resolutionType)
    {
        if (!AllowedResolutionTypes.Contains(resolutionType.Trim()))
        {
            throw new InvalidOperationException("Unsupported return resolution type.");
        }
    }

    private static bool CanManageAfterSales(string role)
        => role is "Admin" or "Staff";

    private static void EnsureReturnStatus(string currentStatus, string requiredStatus)
    {
        if (!string.Equals(currentStatus, requiredStatus, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Return must be in '{requiredStatus}' status.");
        }
    }

    private async Task<string> GenerateDocumentNumberAsync(string prefix, IQueryable<string> source, CancellationToken cancellationToken)
    {
        var count = await source.CountAsync(cancellationToken) + 1;
        return $"{prefix}-{DateTimeOffset.UtcNow:yyyyMMdd}-{count:0000}";
    }

    private decimal CalculateRefundAmount(Return entity)
        => entity.Items.Sum(item =>
        {
            var orderItem = dbContext.OrderItems.Single(x => x.Id == item.OrderItemId);
            var unitPrice = orderItem.TotalPrice / Math.Max(1, orderItem.Quantity);
            return Math.Round(unitPrice * item.Quantity, 2, MidpointRounding.AwayFromZero);
        });

    private async Task RestockReturnedItemsAsync(Return entity, int warehouseId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var warehouseExists = await dbContext.Warehouses.AnyAsync(x => x.Id == warehouseId, cancellationToken);
        if (!warehouseExists)
        {
            throw new InvalidOperationException("Warehouse was not found.");
        }

        foreach (var item in entity.Items)
        {
            var inventory = await dbContext.ProductInventory.SingleOrDefaultAsync(
                x => x.ProductId == item.ProductId && x.WarehouseId == warehouseId,
                cancellationToken);

            if (inventory is null)
            {
                inventory = new Products.Entities.ProductInventory
                {
                    ProductId = item.ProductId,
                    WarehouseId = warehouseId,
                    Quantity = 0,
                    ReservedQuantity = 0,
                    ReorderLevel = 0,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                dbContext.ProductInventory.Add(inventory);
            }

            inventory.Quantity += item.Quantity;
            inventory.UpdatedAt = now;

            dbContext.RestockEvents.Add(new RestockEvent
            {
                ReturnItemId = item.Id,
                WarehouseId = warehouseId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                RestockedAt = now,
                CreatedAt = now,
                UpdatedAt = now
            });

            dbContext.ReturnInventoryLedgerEntries.Add(new InventoryLedgerEntry
            {
                ReturnItemId = item.Id,
                WarehouseId = warehouseId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                BalanceAfter = inventory.Quantity,
                TransactionType = "Return",
                ReferenceNo = entity.ReturnNumber,
                Notes = "Returned inventory restocked",
                CreatedAt = now,
                UpdatedAt = now
            });
        }
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
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
