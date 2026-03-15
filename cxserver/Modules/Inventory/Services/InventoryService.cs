using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Entities;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Products.Entities;

namespace cxserver.Modules.Inventory.Services;

public sealed class InventoryService(CodexsunDbContext dbContext, NotificationService notificationService)
{
    private static readonly HashSet<string> ManagerRoles = ["Admin", "Staff", "Vendor"];
    private static readonly HashSet<string> ViewerRoles = ["Admin", "Staff", "Vendor"];
    private static readonly HashSet<string> AllowedMovementTypes = ["IN", "OUT", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT"];

    public async Task<IReadOnlyList<PurchaseOrderResponse>> GetPurchaseOrdersAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return [];
        }

        var query = dbContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.VendorUser)
            .Include(x => x.Vendor)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .AsQueryable();

        if (role == "Vendor")
        {
            var actorVendorIds = GetActorVendorIdsQuery(actorUserId);
            query = query.Where(x => x.VendorUserId == actorUserId || (x.VendorId.HasValue && actorVendorIds.Contains(x.VendorId.Value)));
        }

        return await query.OrderByDescending(x => x.CreatedAt)
            .Select(MapPurchaseOrder())
            .ToListAsync(cancellationToken);
    }

    public async Task<PurchaseOrderResponse?> GetPurchaseOrderByIdAsync(int id, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return null;
        }

        var query = dbContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.VendorUser)
            .Include(x => x.Vendor)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .Where(x => x.Id == id);

        if (role == "Vendor")
        {
            var actorVendorIds = GetActorVendorIdsQuery(actorUserId);
            query = query.Where(x => x.VendorUserId == actorUserId || (x.VendorId.HasValue && actorVendorIds.Contains(x.VendorId.Value)));
        }

        return await query
            .Select(MapPurchaseOrder())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<PurchaseOrderResponse> CreatePurchaseOrderAsync(PurchaseOrderCreateRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);

        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one purchase order item is required.");
        }

        var resolvedVendorUserId = await ResolveRequestedVendorUserIdAsync(request.VendorUserId, actorUserId, role, cancellationToken);
        await EnsureVendorExistsAsync(resolvedVendorUserId, cancellationToken);
        await EnsureCurrencyExistsAsync(request.CurrencyId, cancellationToken);
        var vendorId = await ResolveVendorIdAsync(resolvedVendorUserId, cancellationToken);

        var itemProducts = await LoadProductsForRequestsAsync(
            request.Items.Select(x => (x.ProductId, x.ProductVariantId)).ToList(),
            cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var purchaseOrder = new PurchaseOrder
        {
            PoNumber = await GenerateDocumentNumberAsync("PO", dbContext.PurchaseOrders.Select(x => x.PoNumber), cancellationToken),
            VendorUserId = resolvedVendorUserId,
            VendorId = vendorId,
            CurrencyId = request.CurrencyId,
            Status = "Open",
            ExpectedDate = request.ExpectedDate,
            CreatedByUserId = actorUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                throw new InvalidOperationException("Purchase order item quantity must be greater than zero.");
            }

            if (item.UnitPrice < 0)
            {
                throw new InvalidOperationException("Purchase order item unit price cannot be negative.");
            }

            EnsureLoadedProduct(itemProducts, item.ProductId, item.ProductVariantId);
            purchaseOrder.Items.Add(new PurchaseOrderItem
            {
                ProductId = item.ProductId,
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        purchaseOrder.TotalAmount = purchaseOrder.Items.Sum(x => x.TotalPrice);

        dbContext.PurchaseOrders.Add(purchaseOrder);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Inventory.PurchaseOrderCreate", nameof(PurchaseOrder), purchaseOrder.Id.ToString(), ipAddress, cancellationToken);

        return (await GetPurchaseOrderByIdAsync(purchaseOrder.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<PurchaseOrderResponse?> ReceivePurchaseOrderAsync(int id, PurchaseOrderReceiveRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);
        await EnsureWarehouseAccessibleAsync(request.WarehouseId, actorUserId, role, cancellationToken);

        var purchaseOrder = await dbContext.PurchaseOrders
            .Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (purchaseOrder is null)
        {
            return null;
        }

        if (purchaseOrder.Status == "Received")
        {
            throw new InvalidOperationException("This purchase order has already been received.");
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var item in purchaseOrder.Items)
        {
            await ApplyInventoryDeltaAsync(
                item.ProductId,
                item.ProductVariantId,
                request.WarehouseId,
                item.Quantity,
                item.Quantity,
                0,
                "IN",
                "PurchaseOrder",
                purchaseOrder.Id,
                actorUserId,
                now,
                cancellationToken);
        }

        purchaseOrder.Status = "Received";
        purchaseOrder.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Inventory.ReceivePurchaseOrder", nameof(PurchaseOrder), purchaseOrder.Id.ToString(), ipAddress, cancellationToken);

        return await GetPurchaseOrderByIdAsync(purchaseOrder.Id, actorUserId, role, cancellationToken);
    }

    public async Task<IReadOnlyList<TransferResponse>> GetTransfersAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return [];
        }

        var query = dbContext.WarehouseTransfers
            .AsNoTracking()
            .Include(x => x.FromWarehouse)
            .Include(x => x.ToWarehouse)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .AsQueryable();

        if (role == "Vendor")
        {
            var actorVendorIds = GetActorVendorIdsQuery(actorUserId);
            query = query.Where(x =>
                (x.FromWarehouse.VendorId.HasValue && actorVendorIds.Contains(x.FromWarehouse.VendorId.Value))
                || (x.ToWarehouse.VendorId.HasValue && actorVendorIds.Contains(x.ToWarehouse.VendorId.Value)));
        }

        return await query.OrderByDescending(x => x.CreatedAt)
            .Select(MapTransfer())
            .ToListAsync(cancellationToken);
    }

    public async Task<TransferResponse> CreateTransferAsync(TransferCreateRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);

        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one transfer item is required.");
        }

        if (request.FromWarehouseId == request.ToWarehouseId)
        {
            throw new InvalidOperationException("Transfer warehouses must be different.");
        }

        await EnsureWarehouseAccessibleAsync(request.FromWarehouseId, actorUserId, role, cancellationToken);
        await EnsureWarehouseAccessibleAsync(request.ToWarehouseId, actorUserId, role, cancellationToken);

        var itemProducts = await LoadProductsForRequestsAsync(
            request.Items.Select(x => (x.ProductId, x.ProductVariantId)).ToList(),
            cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var transfer = new WarehouseTransfer
        {
            TransferNumber = await GenerateDocumentNumberAsync("TRF", dbContext.WarehouseTransfers.Select(x => x.TransferNumber), cancellationToken),
            FromWarehouseId = request.FromWarehouseId,
            ToWarehouseId = request.ToWarehouseId,
            Status = "Pending",
            CreatedByUserId = actorUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                throw new InvalidOperationException("Transfer quantity must be greater than zero.");
            }

            EnsureLoadedProduct(itemProducts, item.ProductId, item.ProductVariantId);
            await EnsureWarehouseStockAsync(request.FromWarehouseId, item.ProductId, item.Quantity, cancellationToken);

            transfer.Items.Add(new WarehouseTransferItem
            {
                ProductId = item.ProductId,
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        dbContext.WarehouseTransfers.Add(transfer);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Inventory.TransferCreate", nameof(WarehouseTransfer), transfer.Id.ToString(), ipAddress, cancellationToken);

        return (await GetTransfersAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == transfer.Id);
    }

    public async Task<TransferResponse?> CompleteTransferAsync(int id, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);
        var transfer = await dbContext.WarehouseTransfers
            .Include(x => x.Items)
            .Include(x => x.FromWarehouse)
            .Include(x => x.ToWarehouse)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (transfer is null)
        {
            return null;
        }

        await EnsureWarehouseAccessibleAsync(transfer.FromWarehouseId, actorUserId, role, cancellationToken);
        await EnsureWarehouseAccessibleAsync(transfer.ToWarehouseId, actorUserId, role, cancellationToken);

        if (transfer.Status == "Completed")
        {
            throw new InvalidOperationException("This transfer has already been completed.");
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var item in transfer.Items)
        {
            await EnsureWarehouseStockAsync(transfer.FromWarehouseId, item.ProductId, item.Quantity, cancellationToken);

            await ApplyInventoryDeltaAsync(
                item.ProductId,
                item.ProductVariantId,
                transfer.FromWarehouseId,
                item.Quantity,
                0,
                item.Quantity,
                "TRANSFER_OUT",
                "WarehouseTransfer",
                transfer.Id,
                actorUserId,
                now,
                cancellationToken);

            await ApplyInventoryDeltaAsync(
                item.ProductId,
                item.ProductVariantId,
                transfer.ToWarehouseId,
                item.Quantity,
                item.Quantity,
                0,
                "TRANSFER_IN",
                "WarehouseTransfer",
                transfer.Id,
                actorUserId,
                now,
                cancellationToken);
        }

        transfer.Status = "Completed";
        transfer.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Inventory.TransferComplete", nameof(WarehouseTransfer), transfer.Id.ToString(), ipAddress, cancellationToken);

        return (await GetTransfersAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == transfer.Id);
    }

    public async Task<InventoryAdjustmentRequest> AdjustInventoryAsync(InventoryAdjustmentRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        EnsureManager(role);

        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one adjustment item is required.");
        }

        await EnsureWarehouseAccessibleAsync(request.WarehouseId, actorUserId, role, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        var adjustment = new InventoryAdjustment
        {
            WarehouseId = request.WarehouseId,
            Reason = request.Reason.Trim(),
            CreatedByUserId = actorUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in request.Items)
        {
            var snapshot = await GetOrCreateProductInventoryAsync(item.ProductId, request.WarehouseId, now, cancellationToken);
            await EnsureProductAndVariantAsync(item.ProductId, item.ProductVariantId, cancellationToken);

            var oldQuantity = snapshot.Quantity;
            var difference = item.NewQuantity - oldQuantity;

            adjustment.Items.Add(new InventoryAdjustmentItem
            {
                ProductId = item.ProductId,
                ProductVariantId = item.ProductVariantId,
                OldQuantity = oldQuantity,
                NewQuantity = item.NewQuantity,
                Difference = difference,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        dbContext.InventoryAdjustments.Add(adjustment);
        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var item in adjustment.Items)
        {
            await ApplyInventoryDeltaAsync(
                item.ProductId,
                item.ProductVariantId,
                request.WarehouseId,
                Math.Abs(item.Difference),
                item.Difference > 0 ? item.Difference : 0,
                item.Difference < 0 ? Math.Abs(item.Difference) : 0,
                "ADJUSTMENT",
                "InventoryAdjustment",
                adjustment.Id,
                actorUserId,
                now,
                cancellationToken,
                setAbsoluteQuantity: item.NewQuantity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Inventory.Adjust", nameof(InventoryAdjustment), adjustment.Id.ToString(), ipAddress, cancellationToken);

        return request;
    }

    public async Task<IReadOnlyList<InventorySummaryResponse>> GetWarehouseInventoryAsync(int warehouseId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return [];
        }

        var query = dbContext.ProductInventory
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .Where(x => x.WarehouseId == warehouseId);

        if (role == "Vendor")
        {
            await EnsureWarehouseAccessibleAsync(warehouseId, actorUserId, role, cancellationToken);
        }

        return await query
            .OrderBy(x => x.Product.Name)
            .Select(x => new InventorySummaryResponse
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                ProductSku = x.Product.Sku,
                ProductVariantId = null,
                ProductVariantName = string.Empty,
                WarehouseId = x.WarehouseId ?? 0,
                WarehouseName = x.Warehouse != null ? x.Warehouse.Name : string.Empty,
                QuantityOnHand = x.Quantity,
                ReservedQuantity = x.ReservedQuantity,
                AvailableQuantity = x.Quantity - x.ReservedQuantity,
                ReorderLevel = x.ReorderLevel
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventorySummaryResponse>> GetProductInventoryAsync(int productId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return [];
        }

        var query = dbContext.ProductInventory
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .Where(x => x.ProductId == productId);

        if (role == "Vendor")
        {
            var actorVendorIds = GetActorVendorIdsQuery(actorUserId);
            query = query.Where(x => x.WarehouseId.HasValue && x.Warehouse != null && x.Warehouse.VendorId.HasValue && actorVendorIds.Contains(x.Warehouse.VendorId.Value));
        }

        return await query
            .OrderBy(x => x.Warehouse!.Name)
            .Select(x => new InventorySummaryResponse
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                ProductSku = x.Product.Sku,
                ProductVariantId = null,
                ProductVariantName = string.Empty,
                WarehouseId = x.WarehouseId ?? 0,
                WarehouseName = x.Warehouse != null ? x.Warehouse.Name : string.Empty,
                QuantityOnHand = x.Quantity,
                ReservedQuantity = x.ReservedQuantity,
                AvailableQuantity = x.Quantity - x.ReservedQuantity,
                ReorderLevel = x.ReorderLevel
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovementResponse>> GetStockMovementsAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!CanView(role))
        {
            return [];
        }

        var query = dbContext.StockMovements
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .Include(x => x.Warehouse)
            .Include(x => x.CreatedByUser)
            .AsQueryable();

        if (role == "Vendor")
        {
            var actorVendorIds = GetActorVendorIdsQuery(actorUserId);
            query = query.Where(x => x.Warehouse.VendorId.HasValue && actorVendorIds.Contains(x.Warehouse.VendorId.Value));
        }

        return await query.OrderByDescending(x => x.CreatedAt)
            .Select(x => new StockMovementResponse
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                ProductVariantId = x.ProductVariantId,
                ProductVariantName = x.ProductVariant != null ? x.ProductVariant.VariantName : string.Empty,
                WarehouseId = x.WarehouseId,
                WarehouseName = x.Warehouse.Name,
                MovementType = x.MovementType,
                Quantity = x.Quantity,
                ReferenceType = x.ReferenceType,
                ReferenceId = x.ReferenceId,
                CreatedAt = x.CreatedAt,
                CreatedByUsername = x.CreatedByUser.Username
            })
            .ToListAsync(cancellationToken);
    }

    private async Task ApplyInventoryDeltaAsync(
        int productId,
        int? productVariantId,
        int warehouseId,
        int movementQuantity,
        int quantityIn,
        int quantityOut,
        string movementType,
        string referenceType,
        int referenceId,
        Guid actorUserId,
        DateTimeOffset now,
        CancellationToken cancellationToken,
        int? setAbsoluteQuantity = null)
    {
        if (!AllowedMovementTypes.Contains(movementType))
        {
            throw new InvalidOperationException("Unsupported stock movement type.");
        }

        var inventory = await GetOrCreateProductInventoryAsync(productId, warehouseId, now, cancellationToken);
        if (setAbsoluteQuantity.HasValue)
        {
            inventory.Quantity = setAbsoluteQuantity.Value;
        }
        else
        {
            inventory.Quantity += quantityIn;
            inventory.Quantity -= quantityOut;
        }

        if (inventory.Quantity < 0)
        {
            throw new InvalidOperationException("Inventory cannot become negative.");
        }

        inventory.UpdatedAt = now;

        if (productVariantId.HasValue)
        {
            var variant = await dbContext.ProductVariants.SingleOrDefaultAsync(x => x.Id == productVariantId.Value && x.ProductId == productId, cancellationToken)
                ?? throw new InvalidOperationException("Product variant was not found.");

            if (setAbsoluteQuantity.HasValue)
            {
                variant.InventoryQuantity += setAbsoluteQuantity.Value - (variant.InventoryQuantity < 0 ? 0 : variant.InventoryQuantity);
            }
            else
            {
                variant.InventoryQuantity += quantityIn;
                variant.InventoryQuantity -= quantityOut;
            }

            if (variant.InventoryQuantity < 0)
            {
                throw new InvalidOperationException("Variant inventory cannot become negative.");
            }

            variant.UpdatedAt = now;
        }

        dbContext.StockMovements.Add(new StockMovement
        {
            ProductId = productId,
            ProductVariantId = productVariantId,
            WarehouseId = warehouseId,
            MovementType = movementType,
            Quantity = movementQuantity,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            CreatedByUserId = actorUserId,
            CreatedAt = now,
            UpdatedAt = now
        });

        dbContext.InventoryLedgers.Add(new InventoryLedger
        {
            ProductId = productId,
            ProductVariantId = productVariantId,
            WarehouseId = warehouseId,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            QuantityIn = quantityIn,
            QuantityOut = quantityOut,
            BalanceAfter = inventory.Quantity,
            CreatedByUserId = actorUserId,
            CreatedAt = now,
            UpdatedAt = now
        });

        if (inventory.ReorderLevel > 0 && inventory.Quantity <= inventory.ReorderLevel)
        {
            var productName = await dbContext.Products
                .Where(x => x.Id == productId)
                .Select(x => x.Name)
                .SingleAsync(cancellationToken);
            var warehouseName = await dbContext.Warehouses
                .Where(x => x.Id == warehouseId)
                .Select(x => x.Name)
                .SingleAsync(cancellationToken);

            await notificationService.QueueLowInventoryAlertAsync(
                productId,
                productName,
                warehouseId,
                warehouseName,
                inventory.Quantity,
                inventory.ReorderLevel,
                cancellationToken);
        }
    }

    private async Task<ProductInventory> GetOrCreateProductInventoryAsync(int productId, int warehouseId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var inventory = await dbContext.ProductInventory
            .SingleOrDefaultAsync(x => x.ProductId == productId && x.WarehouseId == warehouseId, cancellationToken);

        if (inventory is not null)
        {
            return inventory;
        }

        inventory = new ProductInventory
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = 0,
            ReservedQuantity = 0,
            ReorderLevel = 0,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.ProductInventory.Add(inventory);
        return inventory;
    }

    private async Task EnsureWarehouseStockAsync(int warehouseId, int productId, int requiredQuantity, CancellationToken cancellationToken)
    {
        var available = await dbContext.ProductInventory
            .Where(x => x.WarehouseId == warehouseId && x.ProductId == productId)
            .Select(x => x.Quantity - x.ReservedQuantity)
            .SingleOrDefaultAsync(cancellationToken);

        if (available < requiredQuantity)
        {
            throw new InvalidOperationException("Insufficient stock in the source warehouse.");
        }
    }

    private async Task EnsureProductAndVariantAsync(int productId, int? productVariantId, CancellationToken cancellationToken)
    {
        var productExists = await dbContext.Products.AnyAsync(x => x.Id == productId, cancellationToken);
        if (!productExists)
        {
            throw new InvalidOperationException("Product was not found.");
        }

        if (productVariantId.HasValue)
        {
            var variantExists = await dbContext.ProductVariants.AnyAsync(
                x => x.Id == productVariantId.Value && x.ProductId == productId,
                cancellationToken);

            if (!variantExists)
            {
                throw new InvalidOperationException("Product variant was not found.");
            }
        }
    }

    private async Task<List<(int ProductId, int? ProductVariantId)>> LoadProductsForRequestsAsync(List<(int ProductId, int? ProductVariantId)> pairs, CancellationToken cancellationToken)
    {
        foreach (var pair in pairs)
        {
            await EnsureProductAndVariantAsync(pair.ProductId, pair.ProductVariantId, cancellationToken);
        }

        return pairs;
    }

    private static void EnsureLoadedProduct(List<(int ProductId, int? ProductVariantId)> loaded, int productId, int? productVariantId)
    {
        if (!loaded.Contains((productId, productVariantId)))
        {
            throw new InvalidOperationException("A referenced product was not loaded.");
        }
    }

    private async Task EnsureVendorExistsAsync(Guid vendorUserId, CancellationToken cancellationToken)
    {
        var exists = await dbContext.Users.AnyAsync(
            x => x.Id == vendorUserId && !x.IsDeleted && x.Role.Name == "Vendor",
            cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Selected vendor user was not found.");
        }
    }

    private async Task<Guid> ResolveRequestedVendorUserIdAsync(Guid requestedVendorUserId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (role != "Vendor")
        {
            return requestedVendorUserId;
        }

        if (requestedVendorUserId == actorUserId)
        {
            return actorUserId;
        }

        var actorVendorIds = await GetActorVendorIdsQuery(actorUserId).ToListAsync(cancellationToken);
        var requestedVendorId = await ResolveVendorIdAsync(requestedVendorUserId, cancellationToken);

        if (!requestedVendorId.HasValue || !actorVendorIds.Contains(requestedVendorId.Value))
        {
            throw new InvalidOperationException("Vendors can only create purchase orders within their vendor company scope.");
        }

        return requestedVendorUserId;
    }

    private async Task<int?> ResolveVendorIdAsync(Guid vendorUserId, CancellationToken cancellationToken)
        => await dbContext.VendorUsers
            .Where(x => x.UserId == vendorUserId)
            .Select(x => (int?)x.VendorId)
            .FirstOrDefaultAsync(cancellationToken);

    private async Task EnsureCurrencyExistsAsync(int? currencyId, CancellationToken cancellationToken)
    {
        if (!currencyId.HasValue)
        {
            return;
        }

        if (!await dbContext.Currencies.AnyAsync(x => x.Id == currencyId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Currency was not found.");
        }
    }

    private async Task EnsureWarehouseExistsAsync(int warehouseId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Warehouses.AnyAsync(x => x.Id == warehouseId, cancellationToken))
        {
            throw new InvalidOperationException("Warehouse was not found.");
        }
    }

    private async Task EnsureWarehouseAccessibleAsync(int warehouseId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        await EnsureWarehouseExistsAsync(warehouseId, cancellationToken);

        if (role != "Vendor")
        {
            return;
        }

        var accessible = await dbContext.Warehouses.AnyAsync(
            x => x.Id == warehouseId
                && x.VendorId.HasValue
                && GetActorVendorIdsQuery(actorUserId).Contains(x.VendorId.Value),
            cancellationToken);

        if (!accessible)
        {
            throw new InvalidOperationException("Selected warehouse is outside your vendor scope.");
        }
    }

    private IQueryable<int> GetActorVendorIdsQuery(Guid actorUserId)
        => dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

    private static bool CanView(string role) => ViewerRoles.Contains(role);

    private static void EnsureManager(string role)
    {
        if (!ManagerRoles.Contains(role))
        {
            throw new InvalidOperationException("You do not have permission to manage inventory.");
        }
    }

    private static global::System.Linq.Expressions.Expression<Func<PurchaseOrder, PurchaseOrderResponse>> MapPurchaseOrder()
    {
        return x => new PurchaseOrderResponse
        {
            Id = x.Id,
            PoNumber = x.PoNumber,
            VendorUserId = x.VendorUserId,
            VendorId = x.VendorId,
            VendorCompanyName = x.Vendor != null ? x.Vendor.CompanyName : string.Empty,
            VendorName = x.VendorUser.Username,
            CurrencyId = x.CurrencyId,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            Status = x.Status,
            TotalAmount = x.TotalAmount,
            ExpectedDate = x.ExpectedDate,
            CreatedAt = x.CreatedAt,
            Items = x.Items.Select(item => new PurchaseOrderItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductVariantId = item.ProductVariantId,
                ProductVariantName = item.ProductVariant != null ? item.ProductVariant.VariantName : string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        };
    }

    private static global::System.Linq.Expressions.Expression<Func<WarehouseTransfer, TransferResponse>> MapTransfer()
    {
        return x => new TransferResponse
        {
            Id = x.Id,
            TransferNumber = x.TransferNumber,
            FromWarehouseId = x.FromWarehouseId,
            FromWarehouseName = x.FromWarehouse.Name,
            ToWarehouseId = x.ToWarehouseId,
            ToWarehouseName = x.ToWarehouse.Name,
            Status = x.Status,
            CreatedAt = x.CreatedAt,
            Items = x.Items.Select(item => new TransferItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductVariantId = item.ProductVariantId,
                ProductVariantName = item.ProductVariant != null ? item.ProductVariant.VariantName : string.Empty,
                Quantity = item.Quantity
            }).ToList()
        };
    }

    private async Task<string> GenerateDocumentNumberAsync(string prefix, IQueryable<string> source, CancellationToken cancellationToken)
    {
        var count = await source.CountAsync(cancellationToken) + 1;
        return $"{prefix}-{DateTimeOffset.UtcNow:yyyyMMdd}-{count:0000}";
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
            Module = "Inventory",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
