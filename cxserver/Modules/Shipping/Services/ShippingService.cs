using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Shipping.DTOs;
using cxserver.Modules.Shipping.Entities;

namespace cxserver.Modules.Shipping.Services;

public sealed class ShippingService(CodexsunDbContext dbContext, NotificationService notificationService)
{
    private static readonly HashSet<string> ManageRoles = ["Admin", "Staff"];

    public async Task<IReadOnlyList<ShippingMethodResponse>> GetShippingMethodsAsync(CancellationToken cancellationToken)
        => await dbContext.ShippingMethods.AsNoTracking()
            .Include(x => x.Provider)
            .OrderBy(x => x.Name)
            .Select(x => new ShippingMethodResponse
            {
                Id = x.Id,
                Name = x.Name,
                ProviderName = x.Provider.Name,
                BaseCost = x.BaseCost,
                CostPerKg = x.CostPerKg,
                EstimatedDays = x.EstimatedDays
            })
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ShipmentResponse>> GetShipmentsAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
        => await BuildVisibleShipmentsQuery(actorUserId, role)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapShipment())
            .ToListAsync(cancellationToken);

    public async Task<ShipmentResponse?> TrackShipmentAsync(string trackingNumber, Guid actorUserId, string role, CancellationToken cancellationToken)
        => await BuildVisibleShipmentsQuery(actorUserId, role)
            .Where(x => x.TrackingNumber == trackingNumber)
            .Select(MapShipment())
            .SingleOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<ShipmentResponse>> GetShipmentsForOrderAsync(int orderId, Guid actorUserId, string role, CancellationToken cancellationToken)
        => await BuildVisibleShipmentsQuery(actorUserId, role)
            .Where(x => x.OrderId == orderId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapShipment())
            .ToListAsync(cancellationToken);

    public async Task<ShipmentResponse> CreateShipmentAsync(ShipmentCreateRequest request, Guid actorUserId, string role,
        string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);
        return await CreateShipmentInternalAsync(request, actorUserId, ipAddress, sendShipmentNotification: true, initialStatus: "Created", markShippedAtCreation: true, cancellationToken);
    }

    public async Task<ShipmentResponse> EnsureShipmentForOrderAsync(int orderId, Guid? actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (role is not ("Admin" or "Staff" or "System" or "Customer"))
        {
            throw new InvalidOperationException("You do not have permission to create shipments.");
        }

        var existingShipment = await dbContext.Shipments
            .AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.ShippingMethod).ThenInclude(x => x.Provider)
            .Include(x => x.Items).ThenInclude(x => x.OrderItem).ThenInclude(x => x.Product)
            .Where(x => x.OrderId == orderId)
            .Select(MapShipment())
            .FirstOrDefaultAsync(cancellationToken);
        if (existingShipment is not null)
        {
            return existingShipment;
        }

        var order = await dbContext.Orders
            .Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == orderId, cancellationToken)
            ?? throw new InvalidOperationException("Order was not found.");

        if (order.PaymentStatus != "Completed" && order.OrderStatus != "Confirmed")
        {
            throw new InvalidOperationException("Shipment can only be created for paid or confirmed orders.");
        }

        var shippingMethod = await ResolveShippingMethodAsync(order.ShippingMethod, cancellationToken)
            ?? throw new InvalidOperationException("No shipping method is available for this order.");

        var request = new ShipmentCreateRequest
        {
            OrderId = order.Id,
            ShippingMethodId = shippingMethod.Id,
            TrackingNumber = $"AUTO-{order.OrderNumber}",
            Items = order.Items.Select(item => new ShipmentItemCreateRequest
            {
                OrderItemId = item.Id,
                Quantity = item.Quantity
            }).ToList()
        };

        return await CreateShipmentInternalAsync(request, actorUserId, ipAddress, sendShipmentNotification: false, initialStatus: "Ready", markShippedAtCreation: false, cancellationToken);
    }

    private async Task<ShipmentResponse> CreateShipmentInternalAsync(ShipmentCreateRequest request, Guid? actorUserId, string ipAddress, bool sendShipmentNotification, string initialStatus, bool markShippedAtCreation, CancellationToken cancellationToken)
    {
        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one shipment item is required.");
        }

        var order = await dbContext.Orders.Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken)
            ?? throw new InvalidOperationException("Order was not found.");

        var method = await dbContext.ShippingMethods.AnyAsync(x => x.Id == request.ShippingMethodId, cancellationToken);
        if (!method)
        {
            throw new InvalidOperationException("Shipping method was not found.");
        }

        if (await dbContext.Shipments.AnyAsync(x => x.TrackingNumber == request.TrackingNumber.Trim(), cancellationToken))
        {
            throw new InvalidOperationException("Tracking number already exists.");
        }

        var orderItems = order.Items.ToDictionary(x => x.Id);
        var now = DateTimeOffset.UtcNow;
        var entity = new Shipment
        {
            OrderId = request.OrderId,
            ShippingMethodId = request.ShippingMethodId,
            TrackingNumber = request.TrackingNumber.Trim(),
            Status = initialStatus,
            ShippedAt = markShippedAtCreation ? now : null,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in request.Items)
        {
            if (!orderItems.TryGetValue(item.OrderItemId, out var orderItem))
            {
                throw new InvalidOperationException($"Order item {item.OrderItemId} was not found.");
            }

            if (item.Quantity <= 0 || item.Quantity > orderItem.Quantity)
            {
                throw new InvalidOperationException("Shipment quantity must be between 1 and the ordered quantity.");
            }

            entity.Items.Add(new ShipmentItem
            {
                OrderItemId = item.OrderItemId,
                Quantity = item.Quantity,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        dbContext.Shipments.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Shipping.CreateShipment", nameof(Shipment), entity.Id.ToString(), ipAddress, cancellationToken);
        if (sendShipmentNotification)
        {
            await notificationService.QueueEventAsync(NotificationTemplateCatalog.ShipmentShipped, order.CustomerUserId, new Dictionary<string, string>
            {
                ["ShipmentId"] = entity.Id.ToString(),
                ["OrderNumber"] = order.OrderNumber,
                ["TrackingNumber"] = entity.TrackingNumber,
                ["OccurredAt"] = now.ToString("O")
            }, cancellationToken);
        }
        return await dbContext.Shipments
            .AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.ShippingMethod).ThenInclude(x => x.Provider)
            .Include(x => x.Items).ThenInclude(x => x.OrderItem).ThenInclude(x => x.Product)
            .Where(x => x.Id == entity.Id)
            .Select(MapShipment())
            .SingleAsync(cancellationToken);
    }

    public async Task<ShipmentResponse?> UpdateShipmentStatusAsync(int shipmentId, ShipmentStatusUpdateRequest request,
        Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);
        var entity = await dbContext.Shipments.SingleOrDefaultAsync(x => x.Id == shipmentId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        entity.Status = request.Status.Trim();
        entity.UpdatedAt = now;
        if (entity.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
        {
            entity.DeliveredAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Shipping.UpdateShipment", nameof(Shipment), entity.Id.ToString(), ipAddress, cancellationToken);
        if (entity.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
        {
            var customerUserId = await dbContext.Orders
                .Where(x => x.Id == entity.OrderId)
                .Select(x => x.CustomerUserId)
                .SingleOrDefaultAsync(cancellationToken);

            await notificationService.QueueEventAsync(NotificationTemplateCatalog.ShipmentDelivered, customerUserId, new Dictionary<string, string>
            {
                ["ShipmentId"] = entity.Id.ToString(),
                ["TrackingNumber"] = entity.TrackingNumber,
                ["OccurredAt"] = now.ToString("O")
            }, cancellationToken);
        }
        return (await GetShipmentsAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    private static global::System.Linq.Expressions.Expression<Func<Shipment, ShipmentResponse>> MapShipment()
    {
        return x => new ShipmentResponse
        {
            Id = x.Id,
            OrderId = x.OrderId,
            OrderNumber = x.Order.OrderNumber,
            ShippingMethodId = x.ShippingMethodId,
            ShippingMethodName = x.ShippingMethod.Name,
            ProviderName = x.ShippingMethod.Provider.Name,
            TrackingNumber = x.TrackingNumber,
            Status = x.Status,
            ShippedAt = x.ShippedAt,
            DeliveredAt = x.DeliveredAt,
            Items = x.Items.Select(item => new ShipmentItemResponse
            {
                Id = item.Id,
                OrderItemId = item.OrderItemId,
                ProductId = item.OrderItem.ProductId,
                ProductName = item.OrderItem.Product.Name,
                Quantity = item.Quantity
            }).ToList()
        };
    }

    private static void EnsureManager(string role)
    {
        if (!ManageRoles.Contains(role))
        {
            throw new InvalidOperationException("You do not have permission to manage shipments.");
        }
    }

    private async Task<ShippingMethod?> ResolveShippingMethodAsync(string selectedShippingMethod, CancellationToken cancellationToken)
    {
        var trimmed = selectedShippingMethod.Trim();
        if (!string.IsNullOrWhiteSpace(trimmed))
        {
            var exact = await dbContext.ShippingMethods.FirstOrDefaultAsync(x => x.Name == trimmed, cancellationToken);
            if (exact is not null)
            {
                return exact;
            }
        }

        return await dbContext.ShippingMethods.OrderBy(x => x.Id).FirstOrDefaultAsync(cancellationToken);
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
            Module = "Shipping",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<Shipment> BuildVisibleShipmentsQuery(Guid actorUserId, string role)
    {
        var query = dbContext.Shipments
            .AsNoTracking()
            .Include(x => x.Order)
            .Include(x => x.ShippingMethod).ThenInclude(x => x.Provider)
            .Include(x => x.Items).ThenInclude(x => x.OrderItem).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.OrderItem).ThenInclude(x => x.VendorUser)
            .AsQueryable();

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return role switch
        {
            "Admin" or "Staff" => query,
            "Vendor" => query.Where(x =>
                x.Items.Any(item => item.OrderItem.VendorUserId == actorUserId)
                || x.Items.Any(item => item.OrderItem.VendorUserId.HasValue
                    && dbContext.VendorUsers.Any(vendorUser =>
                        vendorUser.UserId == item.OrderItem.VendorUserId.Value
                        && actorVendorIds.Contains(vendorUser.VendorId)))),
            _ => query.Where(x => x.Order.CustomerUserId == actorUserId)
        };
    }
}
