using System.Linq.Expressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Entities;
using cxserver.Modules.Shipping.Services;

namespace cxserver.Modules.Sales.Services;

public sealed partial class SalesService(CodexsunDbContext dbContext, NotificationService notificationService, RazorpayGatewayService razorpayGatewayService, IOptions<SalesSettings> salesSettingsOptions, ShippingService shippingService)
{
    private const decimal VendorCommissionRate = 0.10m;
    private readonly SalesSettings salesSettings = salesSettingsOptions.Value;

    public async Task<CartResponse> GetCartAsync(Guid? actorUserId, string sessionId, CancellationToken cancellationToken)
    {
        if (actorUserId.HasValue)
        {
            await MergeGuestCartAsync(actorUserId.Value, sessionId, cancellationToken);
        }

        var cart = await LoadCartAsync(actorUserId, sessionId, includeItems: true, cancellationToken);
        return cart is null ? CreateEmptyCartResponse(sessionId) : MapCart(cart);
    }

    public async Task<CartResponse> AddItemToCartAsync(CartItemUpsertRequest request, Guid? actorUserId, CancellationToken cancellationToken)
    {
        ValidateCartIdentity(actorUserId, request.SessionId);
        if (request.Quantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        if (actorUserId.HasValue)
        {
            await MergeGuestCartAsync(actorUserId.Value, request.SessionId, cancellationToken);
        }

        var product = await dbContext.Products
            .Include(x => x.Currency)
            .Include(x => x.GstPercent)
            .Include(x => x.Prices)
            .Include(x => x.VendorLinks)
            .Include(x => x.Variants)
            .SingleOrDefaultAsync(x => x.Id == request.ProductId && x.IsActive, cancellationToken);

        if (product is null)
        {
            throw new InvalidOperationException("Product was not found.");
        }

        ProductVariant? variant = null;
        if (request.ProductVariantId.HasValue)
        {
            variant = product.Variants.SingleOrDefault(x => x.Id == request.ProductVariantId.Value);
            if (variant is null)
            {
                throw new InvalidOperationException("Product variant was not found.");
            }
        }

        var cart = await LoadCartAsync(actorUserId, request.SessionId, includeItems: true, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = actorUserId,
                SessionId = request.SessionId.Trim(),
                CurrencyId = request.CurrencyId ?? product.CurrencyId,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.Carts.Add(cart);
        }

        var vendorUserId = ResolveCartVendorUserId(request.VendorUserId, product);
        var existingItem = cart.Items.SingleOrDefault(x =>
            x.ProductId == request.ProductId &&
            x.ProductVariantId == request.ProductVariantId &&
            x.VendorUserId == vendorUserId);
        var resolvedQuantity = existingItem is null ? request.Quantity : existingItem.Quantity + request.Quantity;
        var unitPrice = ResolveUnitPrice(product, variant, vendorUserId, resolvedQuantity, now);

        if (existingItem is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductId = request.ProductId,
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = unitPrice * request.Quantity,
                VendorUserId = vendorUserId,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            existingItem.Quantity += request.Quantity;
            existingItem.UnitPrice = unitPrice;
            existingItem.TotalPrice = existingItem.Quantity * unitPrice;
            existingItem.UpdatedAt = now;
        }

        cart.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapCart(await LoadCartAsync(actorUserId, request.SessionId, includeItems: true, cancellationToken) ?? cart);
    }

    public async Task<CartResponse?> UpdateCartItemAsync(int itemId, CartItemUpdateRequest request, Guid? actorUserId, string sessionId, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        var item = await dbContext.CartItems
            .Include(x => x.Cart)
            .Include(x => x.Product).ThenInclude(x => x.Prices)
            .Include(x => x.Product).ThenInclude(x => x.VendorLinks)
            .Include(x => x.ProductVariant)
            .SingleOrDefaultAsync(x => x.Id == itemId, cancellationToken);

        if (item is null || !CanAccessCart(item.Cart, actorUserId, sessionId))
        {
            return null;
        }

        item.Quantity = request.Quantity;
        item.UnitPrice = ResolveUnitPrice(item.Product, item.ProductVariant, item.VendorUserId, request.Quantity, DateTimeOffset.UtcNow);
        item.TotalPrice = item.UnitPrice * request.Quantity;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        item.Cart.UpdatedAt = item.UpdatedAt;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetCartAsync(actorUserId, item.Cart.SessionId, cancellationToken);
    }

    public async Task<bool> RemoveCartItemAsync(int itemId, Guid? actorUserId, string sessionId, CancellationToken cancellationToken)
    {
        var item = await dbContext.CartItems
            .Include(x => x.Cart)
            .SingleOrDefaultAsync(x => x.Id == itemId, cancellationToken);

        if (item is null || !CanAccessCart(item.Cart, actorUserId, sessionId))
        {
            return false;
        }

        dbContext.CartItems.Remove(item);
        item.Cart.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ClearCartAsync(Guid? actorUserId, string sessionId, CancellationToken cancellationToken)
    {
        var cart = await LoadCartAsync(actorUserId, sessionId, includeItems: true, cancellationToken);
        if (cart is null)
        {
            return false;
        }

        dbContext.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<OrderSummaryResponse>> GetOrdersAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        return await BuildVisibleOrdersQuery(actorUserId, role)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapOrderSummary())
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderDetailResponse?> GetOrderByIdAsync(int orderId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        return await BuildVisibleOrdersQuery(actorUserId, role)
            .Where(x => x.Id == orderId)
            .Select(MapOrderDetail())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<OrderDetailResponse> CreateOrderAsync(CreateOrderRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ShippingMethod))
        {
            throw new InvalidOperationException("Shipping method is required.");
        }

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            throw new InvalidOperationException("Payment method is required.");
        }

        if (!string.Equals(request.PaymentMethod.Trim(), "cod", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(request.PaymentMethod.Trim(), "razorpay", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Unsupported payment method.");
        }

        var normalizedIdempotencyKey = request.IdempotencyKey.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedIdempotencyKey))
        {
            var existingOrderId = await dbContext.Orders
                .Where(x => x.CustomerUserId == actorUserId && x.IdempotencyKey == normalizedIdempotencyKey)
                .Select(x => (int?)x.Id)
                .SingleOrDefaultAsync(cancellationToken);

            if (existingOrderId.HasValue)
            {
                return (await GetOrderByIdAsync(existingOrderId.Value, actorUserId, role, cancellationToken))!;
            }
        }

        var cart = await ResolveCheckoutCartAsync(request, actorUserId, cancellationToken);
        if (cart.Items.Count == 0)
        {
            throw new InvalidOperationException("Cart is empty.");
        }

        if (request.CustomerContactId.HasValue)
        {
            var contactExists = await dbContext.Contacts.AnyAsync(x => x.Id == request.CustomerContactId.Value && x.IsActive, cancellationToken);
            if (!contactExists)
            {
                throw new InvalidOperationException("Selected customer contact was not found.");
            }
        }

        var now = DateTimeOffset.UtcNow;
        var orderItemPairs = new List<(OrderItem OrderItem, CartItem CartItem)>();
        var order = new Order
        {
            OrderNumber = await GenerateDocumentNumberAsync("ORD", dbContext.Orders.Select(x => x.OrderNumber), cancellationToken),
            IdempotencyKey = normalizedIdempotencyKey,
            CustomerUserId = role == "Customer" ? actorUserId : null,
            CustomerContactId = request.CustomerContactId,
            CurrencyId = request.CurrencyId ?? cart.CurrencyId ?? cart.Items.Select(x => x.Product.CurrencyId).FirstOrDefault(),
            PaymentProvider = string.Equals(request.PaymentMethod.Trim(), "razorpay", StringComparison.OrdinalIgnoreCase) ? "Razorpay" : string.Empty,
            ShippingMethod = request.ShippingMethod.Trim(),
            PaymentMethod = request.PaymentMethod.Trim(),
            OrderStatus = "Pending",
            PaymentStatus = "Pending",
            DiscountAmount = request.DiscountAmount,
            CreatedAt = now,
            UpdatedAt = now
        };

        var subtotal = 0m;
        var taxAmount = 0m;
        foreach (var cartItem in cart.Items)
        {
            var itemTax = CalculateTax(cartItem.Product, cartItem.Quantity, cartItem.UnitPrice);
            subtotal += cartItem.TotalPrice;
            taxAmount += itemTax;

            var orderItem = new OrderItem
            {
                ProductId = cartItem.ProductId,
                Product = cartItem.Product,
                ProductVariantId = cartItem.ProductVariantId,
                ProductVariant = cartItem.ProductVariant,
                VendorUserId = cartItem.VendorUserId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice,
                TaxAmount = itemTax,
                TotalPrice = cartItem.TotalPrice + itemTax,
                CreatedAt = now,
                UpdatedAt = now
            };

            order.Items.Add(orderItem);
            orderItemPairs.Add((orderItem, cartItem));
        }

        order.Subtotal = subtotal;
        order.TaxAmount = taxAmount;
        order.TotalAmount = subtotal + taxAmount - request.DiscountAmount;
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = order.OrderStatus,
            Notes = "Order created",
            CreatedAt = now,
            UpdatedAt = now
        });

        ApplyOrderAddress(order, request.BillingAddress, "Billing", now);
        ApplyOrderAddress(order, request.ShippingAddress, "Shipping", now);

        var invoice = BuildInvoice(order, request.InvoiceDueDate, now);
        invoice.InvoiceNumber = await GenerateDocumentNumberAsync("INV", dbContext.Invoices.Select(x => x.InvoiceNumber), cancellationToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        dbContext.Orders.Add(order);
        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(cancellationToken);
        await ReserveOrderInventoryAsync(orderItemPairs, now, cancellationToken);

        foreach (var item in order.Items)
        {
            if (!item.VendorUserId.HasValue)
            {
                continue;
            }

            var vendorId = await ResolveVendorIdAsync(item.VendorUserId.Value, cancellationToken);
            var saleAmount = item.TotalPrice;
            var commissionAmount = Math.Round(saleAmount * VendorCommissionRate, 2, MidpointRounding.AwayFromZero);
            dbContext.VendorEarnings.Add(new VendorEarning
            {
                VendorUserId = item.VendorUserId.Value,
                VendorId = vendorId,
                OrderItemId = item.Id,
                ProductId = item.ProductId,
                OrderId = order.Id,
                SaleAmount = saleAmount,
                CommissionAmount = commissionAmount,
                VendorAmount = saleAmount - commissionAmount,
                IsSettled = false,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        dbContext.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Order.Create", nameof(Order), order.Id.ToString(), ipAddress, cancellationToken);
        await notificationService.QueueEventAsync(NotificationTemplateCatalog.OrderCreated, order.CustomerUserId, new Dictionary<string, string>
        {
            ["OrderId"] = order.Id.ToString(),
            ["OrderNumber"] = order.OrderNumber,
            ["TotalAmount"] = order.TotalAmount.ToString("0.00"),
            ["OccurredAt"] = now.ToString("O")
        }, cancellationToken);
        return (await GetOrderByIdAsync(order.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<OrderDetailResponse?> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
        {
            throw new InvalidOperationException("Order status is required.");
        }

        var order = await dbContext.Orders
            .Include(x => x.StatusHistory)
            .Include(x => x.Items)
            .ThenInclude(x => x.InventoryReservations)
            .SingleOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var previousStatus = order.OrderStatus;
        order.OrderStatus = request.Status.Trim();
        order.UpdatedAt = now;
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = order.OrderStatus,
            Notes = request.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });

        if (!IsCancelledStatus(previousStatus) && IsCancelledStatus(order.OrderStatus))
        {
            await ReleaseOrderReservationsAsync(order.Items, null, now, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Order.UpdateStatus", nameof(Order), order.Id.ToString(), ipAddress, cancellationToken);
        return await GetOrderByIdAsync(order.Id, actorUserId, role, cancellationToken);
    }

    public async Task<IReadOnlyList<InvoiceSummaryResponse>> GetInvoicesAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisibleInvoicesQuery(actorUserId, role)
            .OrderByDescending(x => x.IssuedDate)
            .Select(MapInvoiceSummary())
            .ToListAsync(cancellationToken);
    }

    public async Task<InvoiceDetailResponse?> GetInvoiceByIdAsync(int invoiceId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisibleInvoicesQuery(actorUserId, role)
            .Where(x => x.Id == invoiceId)
            .Select(MapInvoiceDetail())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<InvoiceDetailResponse> CreateInvoiceAsync(CreateInvoiceRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Order was not found.");
        }

        var now = DateTimeOffset.UtcNow;
        var invoice = BuildInvoice(order, request.DueDate, now);
        invoice.InvoiceNumber = await GenerateDocumentNumberAsync("INV", dbContext.Invoices.Select(x => x.InvoiceNumber), cancellationToken);

        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Invoice.Create", nameof(Invoice), invoice.Id.ToString(), ipAddress, cancellationToken);
        return (await GetInvoiceByIdAsync(invoice.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<IReadOnlyList<PaymentSummaryResponse>> GetPaymentsAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisiblePaymentsQuery(actorUserId, role)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PaymentSummaryResponse
            {
                Id = x.Id,
                InvoiceId = x.InvoiceId,
                InvoiceNumber = x.Invoice != null ? x.Invoice.InvoiceNumber : string.Empty,
                PaymentMethodName = x.PaymentMode != null ? x.PaymentMode.Name : string.Empty,
                CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
                Amount = x.Amount,
                Status = x.Status,
                TransactionReference = x.TransactionReference,
                Provider = x.Transactions.OrderBy(transaction => transaction.Id).Select(transaction => transaction.Provider).FirstOrDefault() ?? string.Empty,
                PaidAt = x.PaidAt,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<RazorpayCheckoutSessionResponse> InitializeRazorpayCheckoutAsync(InitializeRazorpayCheckoutRequest request, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        var order = await dbContext.Orders
            .Include(x => x.CustomerUser)
            .Include(x => x.Invoices)
            .SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Order was not found.");
        }

        if (!string.Equals(order.PaymentMethod, "razorpay", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("The selected order is not configured for Razorpay checkout.");
        }

        if (order.PaymentStatus == "Completed")
        {
            throw new InvalidOperationException("This order is already paid.");
        }

        if (IsExpiredStatus(order.OrderStatus) || IsExpiredStatus(order.PaymentStatus))
        {
            throw new InvalidOperationException("This payment session has expired. Please create a new order.");
        }

        if (IsCancelledStatus(order.OrderStatus))
        {
            throw new InvalidOperationException("This order is no longer payable.");
        }

        var invoice = order.Invoices.OrderByDescending(x => x.Id).FirstOrDefault();
        if (invoice is null)
        {
            throw new InvalidOperationException("Invoice was not found for the order.");
        }

        if (!razorpayGatewayService.IsEnabled)
        {
            throw new InvalidOperationException("Razorpay integration is not configured.");
        }

        if (string.IsNullOrWhiteSpace(order.PaymentGatewayOrderId) || string.Equals(order.PaymentStatus, "Failed", StringComparison.OrdinalIgnoreCase))
        {
            var gatewayOrder = await razorpayGatewayService.CreateOrderAsync(
                ToCurrencySubunits(invoice.TotalAmount),
                "INR",
                order.OrderNumber,
                cancellationToken);
            order.PaymentProvider = "Razorpay";
            order.PaymentGatewayOrderId = gatewayOrder.Id;
            order.UpdatedAt = DateTimeOffset.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return new RazorpayCheckoutSessionResponse
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            KeyId = razorpayGatewayService.KeyId,
            RazorpayOrderId = order.PaymentGatewayOrderId,
            AmountInSubunits = ToCurrencySubunits(invoice.TotalAmount),
            Currency = "INR",
            MerchantName = razorpayGatewayService.MerchantName,
            Description = $"Order {order.OrderNumber}",
            CustomerName = order.CustomerUser?.Username ?? string.Empty,
            CustomerEmail = order.CustomerUser?.Email ?? string.Empty,
            CustomerPhone = string.Empty,
            ThemeColor = razorpayGatewayService.ThemeColor
        };
    }

    public async Task<RazorpayPaymentVerificationResponse> VerifyRazorpayPaymentAsync(VerifyRazorpayPaymentRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        var order = await dbContext.Orders
            .Include(x => x.Invoices)
            .SingleOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Order was not found.");
        }

        if (!string.Equals(order.PaymentGatewayOrderId, request.RazorpayOrderId.Trim(), StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Razorpay order id does not match the current order.");
        }

        if (IsExpiredStatus(order.OrderStatus) || IsExpiredStatus(order.PaymentStatus))
        {
            throw new InvalidOperationException("This payment session has expired. Please create a new order.");
        }

        if (!razorpayGatewayService.VerifyCheckoutSignature(request.RazorpayOrderId.Trim(), request.RazorpayPaymentId.Trim(), request.RazorpaySignature.Trim()))
        {
            throw new InvalidOperationException("Razorpay signature verification failed.");
        }

        var invoice = order.Invoices.OrderByDescending(x => x.Id).FirstOrDefault()
            ?? throw new InvalidOperationException("Invoice was not found for the order.");
        var paymentPayload = await razorpayGatewayService.GetPaymentAsync(request.RazorpayPaymentId.Trim(), cancellationToken);

        if (!string.Equals(paymentPayload.OrderId, order.PaymentGatewayOrderId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Razorpay payment does not belong to the expected order.");
        }

        if (paymentPayload.Status is not ("captured" or "authorized"))
        {
            throw new InvalidOperationException("Razorpay payment is not in a successful state.");
        }

        if (paymentPayload.Amount != ToCurrencySubunits(invoice.TotalAmount))
        {
            throw new InvalidOperationException("Razorpay payment amount does not match the order total.");
        }

        var payment = await RecordGatewayPaymentAsync(invoice, paymentPayload, actorUserId, role, ipAddress, cancellationToken);
        var refreshedOrder = await GetOrderByIdAsync(order.Id, actorUserId, role, cancellationToken)
            ?? throw new InvalidOperationException("Order was not found after payment verification.");

        return new RazorpayPaymentVerificationResponse
        {
            OrderId = refreshedOrder.Id,
            OrderNumber = refreshedOrder.OrderNumber,
            OrderStatus = refreshedOrder.OrderStatus,
            PaymentStatus = refreshedOrder.PaymentStatus,
            Payment = payment
        };
    }

    public async Task<RazorpayPaymentVerificationResponse> ReconcileRazorpayOrderAsync(int orderId, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        var order = await dbContext.Orders
            .Include(x => x.Invoices)
            .SingleOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Order was not found.");
        }

        if (!string.Equals(order.PaymentMethod, "razorpay", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("This order does not use Razorpay.");
        }

        if (string.IsNullOrWhiteSpace(order.PaymentGatewayOrderId))
        {
            throw new InvalidOperationException("No Razorpay order is attached to this order.");
        }

        var invoice = order.Invoices.OrderByDescending(x => x.Id).FirstOrDefault()
            ?? throw new InvalidOperationException("Invoice was not found for the order.");
        var gatewayPayments = await razorpayGatewayService.GetOrderPaymentsAsync(order.PaymentGatewayOrderId, cancellationToken);
        var successfulPayment = gatewayPayments
            .Where(x => x.Status is "captured" or "authorized")
            .OrderByDescending(x => x.Id)
            .FirstOrDefault(x => x.Amount == ToCurrencySubunits(invoice.TotalAmount));

        PaymentSummaryResponse? payment = null;
        if (successfulPayment is not null)
        {
            payment = await RecordGatewayPaymentAsync(invoice, successfulPayment, actorUserId, role, ipAddress, cancellationToken);
        }
        else if (gatewayPayments.Any(x => x.Status == "failed") && order.PaymentStatus != "Completed")
        {
            var now = DateTimeOffset.UtcNow;
            order.PaymentStatus = "Failed";
            order.UpdatedAt = now;
            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = order.OrderStatus,
                Notes = "Payment reconciled as failed through Razorpay",
                CreatedAt = now,
                UpdatedAt = now
            });
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var refreshedOrder = await GetOrderByIdAsync(order.Id, actorUserId, role, cancellationToken)
            ?? throw new InvalidOperationException("Order was not found after reconciliation.");

        return new RazorpayPaymentVerificationResponse
        {
            OrderId = refreshedOrder.Id,
            OrderNumber = refreshedOrder.OrderNumber,
            OrderStatus = refreshedOrder.OrderStatus,
            PaymentStatus = refreshedOrder.PaymentStatus,
            Payment = payment ?? new PaymentSummaryResponse()
        };
    }

    public async Task<bool> HandleRazorpayWebhookAsync(string requestBody, string signature, CancellationToken cancellationToken)
    {
        await ExpireStalePendingRazorpayOrdersAsync(cancellationToken);
        if (!razorpayGatewayService.VerifyWebhookSignature(requestBody, signature))
        {
            return false;
        }

        using var document = JsonDocument.Parse(requestBody);
        var root = document.RootElement;
        var eventName = root.TryGetProperty("event", out var eventElement)
            ? eventElement.GetString() ?? string.Empty
            : string.Empty;

        if (eventName == "payment.captured")
        {
            var paymentEntity = root.GetProperty("payload").GetProperty("payment").GetProperty("entity");
            var gatewayPayment = new RazorpayPaymentResponse
            {
                Id = paymentEntity.GetProperty("id").GetString() ?? string.Empty,
                Amount = paymentEntity.GetProperty("amount").GetInt32(),
                Currency = paymentEntity.GetProperty("currency").GetString() ?? "INR",
                Status = paymentEntity.GetProperty("status").GetString() ?? string.Empty,
                OrderId = paymentEntity.GetProperty("order_id").GetString() ?? string.Empty,
                Method = paymentEntity.TryGetProperty("method", out var methodElement) ? methodElement.GetString() ?? string.Empty : string.Empty,
                Vpa = paymentEntity.TryGetProperty("vpa", out var vpaElement) ? vpaElement.GetString() ?? string.Empty : string.Empty
            };

            var order = await dbContext.Orders
                .Include(x => x.Invoices)
                .SingleOrDefaultAsync(x => x.PaymentGatewayOrderId == gatewayPayment.OrderId, cancellationToken);
            if (order is null)
            {
                return true;
            }

            var invoice = order.Invoices.OrderByDescending(x => x.Id).FirstOrDefault();
            if (invoice is null)
            {
                return true;
            }

            await RecordGatewayPaymentAsync(invoice, gatewayPayment, null, "System", "razorpay-webhook", cancellationToken);
            return true;
        }

        if (eventName == "payment.failed")
        {
            var paymentEntity = root.GetProperty("payload").GetProperty("payment").GetProperty("entity");
            var gatewayOrderId = paymentEntity.TryGetProperty("order_id", out var orderIdElement) ? orderIdElement.GetString() ?? string.Empty : string.Empty;
            if (string.IsNullOrWhiteSpace(gatewayOrderId))
            {
                return true;
            }

            var order = await dbContext.Orders
                .Include(x => x.StatusHistory)
                .SingleOrDefaultAsync(x => x.PaymentGatewayOrderId == gatewayOrderId, cancellationToken);
            if (order is null)
            {
                return true;
            }

            var now = DateTimeOffset.UtcNow;
            order.PaymentStatus = "Failed";
            order.UpdatedAt = now;
            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = order.OrderStatus,
                Notes = "Payment failed through Razorpay",
                CreatedAt = now,
                UpdatedAt = now
            });
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }

        return true;
    }

    public async Task<PaymentSummaryResponse> RecordPaymentAsync(RecordPaymentRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
        {
            throw new InvalidOperationException("Payment amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Provider))
        {
            throw new InvalidOperationException("Payment provider is required.");
        }

        var normalizedReference = request.TransactionReference.Trim();
        if (string.IsNullOrWhiteSpace(normalizedReference))
        {
            throw new InvalidOperationException("Transaction reference is required.");
        }

        var invoice = await dbContext.Invoices
            .Include(x => x.Order)
            .ThenInclude(x => x!.StatusHistory)
            .Include(x => x.Payments)
            .ThenInclude(x => x.Transactions)
            .SingleOrDefaultAsync(x => x.Id == request.InvoiceId, cancellationToken);

        if (invoice is null || !await CanAccessInvoiceAsync(invoice.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Invoice was not found.");
        }

        var normalizedProvider = request.Provider.Trim();
        var existingPayment = invoice.Payments.FirstOrDefault(x =>
            x.Transactions.Any(transaction =>
                transaction.Provider == normalizedProvider &&
                transaction.Reference == normalizedReference &&
                transaction.Status == "Completed"));

        if (existingPayment is not null)
        {
            return (await GetPaymentsAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == existingPayment.Id);
        }

        var alreadyPaid = invoice.Payments.Sum(x => x.Amount);
        var remainingAmount = invoice.TotalAmount - alreadyPaid;
        if (remainingAmount <= 0)
        {
            throw new InvalidOperationException("Invoice is already fully paid.");
        }

        if (request.Amount > remainingAmount)
        {
            throw new InvalidOperationException("Payment amount cannot exceed the outstanding invoice balance.");
        }

        return await PersistCompletedPaymentAsync(
            invoice,
            request.PaymentModeId,
            request.Amount,
            request.CurrencyId ?? invoice.CurrencyId,
            normalizedProvider,
            normalizedReference,
            actorUserId,
            role,
            ipAddress,
            cancellationToken);
    }

    public async Task<IReadOnlyList<VendorPayoutSummaryResponse>> GetVendorPayoutsAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisiblePayoutsQuery(actorUserId, role)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new VendorPayoutSummaryResponse
            {
                Id = x.Id,
                VendorUserId = x.VendorUserId,
                VendorId = x.VendorId,
                VendorCompanyName = x.Vendor != null ? x.Vendor.CompanyName : string.Empty,
                VendorName = x.VendorUser.Username,
                PayoutNumber = x.PayoutNumber,
                CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
                Amount = x.Amount,
                Status = x.Status,
                RequestedAt = x.RequestedAt,
                ProcessedAt = x.ProcessedAt,
                Earnings = x.Items.Select(item => new VendorEarningResponse
                {
                    Id = item.VendorEarning.Id,
                    VendorId = item.VendorEarning.VendorId,
                    VendorCompanyName = item.VendorEarning.Vendor != null ? item.VendorEarning.Vendor.CompanyName : string.Empty,
                    OrderId = item.VendorEarning.OrderId,
                    OrderNumber = item.VendorEarning.Order.OrderNumber,
                    ProductId = item.VendorEarning.ProductId,
                    ProductName = item.VendorEarning.Product.Name,
                    SaleAmount = item.VendorEarning.SaleAmount,
                    CommissionAmount = item.VendorEarning.CommissionAmount,
                    VendorAmount = item.VendorEarning.VendorAmount,
                    IsSettled = item.VendorEarning.IsSettled
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<VendorPayoutSummaryResponse> CreateVendorPayoutAsync(CreateVendorPayoutRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var vendorUserId = role == "Vendor"
            ? actorUserId
            : request.VendorUserId ?? throw new InvalidOperationException("Vendor user is required.");
        var vendorId = await ResolveVendorIdAsync(vendorUserId, cancellationToken);

        var earnings = await dbContext.VendorEarnings
            .Where(x => x.VendorUserId == vendorUserId && !x.IsSettled)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        if (earnings.Count == 0)
        {
            throw new InvalidOperationException("No pending vendor earnings were found.");
        }

        var now = DateTimeOffset.UtcNow;
        var payout = new VendorPayout
        {
            VendorUserId = vendorUserId,
            VendorId = vendorId,
            PayoutNumber = await GenerateDocumentNumberAsync("VPO", dbContext.VendorPayouts.Select(x => x.PayoutNumber), cancellationToken),
            Amount = earnings.Sum(x => x.VendorAmount),
            CurrencyId = request.CurrencyId ?? dbContext.Orders.OrderByDescending(x => x.Id).Select(x => x.CurrencyId).FirstOrDefault(),
            Status = "Pending",
            RequestedAt = now,
            CreatedAt = now,
            UpdatedAt = now,
            Items = earnings.Select(earning => new VendorPayoutItem
            {
                VendorEarningId = earning.Id,
                Amount = earning.VendorAmount,
                CreatedAt = now,
                UpdatedAt = now
            }).ToList()
        };

        dbContext.VendorPayouts.Add(payout);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "VendorPayout.Create", nameof(VendorPayout), payout.Id.ToString(), ipAddress, cancellationToken);
        await notificationService.QueueEventAsync(NotificationTemplateCatalog.VendorPayoutCreated, payout.VendorUserId, new Dictionary<string, string>
        {
            ["PayoutId"] = payout.Id.ToString(),
            ["PayoutNumber"] = payout.PayoutNumber,
            ["Amount"] = payout.Amount.ToString("0.00"),
            ["OccurredAt"] = now.ToString("O")
        }, cancellationToken);
        return (await GetVendorPayoutsAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == payout.Id);
    }

    public async Task<VendorPayoutSummaryResponse?> ApproveVendorPayoutAsync(int payoutId, ApproveVendorPayoutRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (role != "Admin" && role != "Staff")
        {
            return null;
        }

        var payout = await dbContext.VendorPayouts
            .Include(x => x.Items)
            .ThenInclude(x => x.VendorEarning)
            .SingleOrDefaultAsync(x => x.Id == payoutId, cancellationToken);

        if (payout is null)
        {
            return null;
        }

        payout.Status = request.MarkAsPaid ? "Paid" : "Approved";
        payout.ProcessedAt = DateTimeOffset.UtcNow;
        payout.UpdatedAt = payout.ProcessedAt.Value;

        if (request.MarkAsPaid)
        {
            foreach (var item in payout.Items)
            {
                item.VendorEarning.IsSettled = true;
                item.VendorEarning.UpdatedAt = payout.UpdatedAt;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "VendorPayout.Approve", nameof(VendorPayout), payout.Id.ToString(), ipAddress, cancellationToken);
        return (await GetVendorPayoutsAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == payout.Id);
    }

    private static Expression<Func<Order, OrderSummaryResponse>> MapOrderSummary()
    {
        return x => new OrderSummaryResponse
        {
            Id = x.Id,
            OrderNumber = x.OrderNumber,
            ShippingMethod = x.ShippingMethod,
            PaymentMethod = x.PaymentMethod,
            CustomerContactId = x.CustomerContactId,
            CustomerName = x.CustomerContact != null ? x.CustomerContact.DisplayName : string.Empty,
            OrderStatus = x.OrderStatus,
            PaymentStatus = x.PaymentStatus,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            Subtotal = x.Subtotal,
            TaxAmount = x.TaxAmount,
            DiscountAmount = x.DiscountAmount,
            TotalAmount = x.TotalAmount,
            ItemCount = x.Items.Count,
            CreatedAt = x.CreatedAt
        };
    }

    private static Expression<Func<Order, OrderDetailResponse>> MapOrderDetail()
    {
        return x => new OrderDetailResponse
        {
            Id = x.Id,
            OrderNumber = x.OrderNumber,
            ShippingMethod = x.ShippingMethod,
            PaymentMethod = x.PaymentMethod,
            CustomerContactId = x.CustomerContactId,
            CustomerName = x.CustomerContact != null ? x.CustomerContact.DisplayName : string.Empty,
            OrderStatus = x.OrderStatus,
            PaymentStatus = x.PaymentStatus,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            Subtotal = x.Subtotal,
            TaxAmount = x.TaxAmount,
            DiscountAmount = x.DiscountAmount,
            TotalAmount = x.TotalAmount,
            ItemCount = x.Items.Count,
            CreatedAt = x.CreatedAt,
            Items = x.Items.Select(item => new OrderItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductSku = item.Product.Sku,
                ProductVariantId = item.ProductVariantId,
                ProductVariantName = item.ProductVariant != null ? item.ProductVariant.VariantName : string.Empty,
                VendorUserId = item.VendorUserId,
                VendorName = item.VendorUser != null ? item.VendorUser.Username : string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxAmount = item.TaxAmount,
                TotalPrice = item.TotalPrice
            }).ToList(),
            StatusHistory = x.StatusHistory.OrderByDescending(item => item.CreatedAt).Select(item => new OrderStatusHistoryResponse
            {
                Id = item.Id,
                Status = item.Status,
                Notes = item.Notes,
                CreatedAt = item.CreatedAt
            }).ToList(),
            Addresses = x.Addresses.OrderBy(item => item.AddressType).Select(item => new OrderAddressResponse
            {
                Id = item.Id,
                ContactId = item.ContactId,
                AddressType = item.AddressType,
                AddressLine1 = item.AddressLine1,
                AddressLine2 = item.AddressLine2,
                City = item.City,
                State = item.State,
                Country = item.Country,
                PostalCode = item.PostalCode
            }).ToList()
        };
    }

    private static Expression<Func<Invoice, InvoiceSummaryResponse>> MapInvoiceSummary()
    {
        return x => new InvoiceSummaryResponse
        {
            Id = x.Id,
            InvoiceNumber = x.InvoiceNumber,
            OrderId = x.OrderId,
            OrderNumber = x.Order != null ? x.Order.OrderNumber : string.Empty,
            CustomerContactId = x.CustomerContactId,
            CustomerName = x.CustomerContact != null ? x.CustomerContact.DisplayName : string.Empty,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            Subtotal = x.Subtotal,
            TaxAmount = x.TaxAmount,
            TotalAmount = x.TotalAmount,
            Status = x.Status,
            IssuedDate = x.IssuedDate,
            DueDate = x.DueDate
        };
    }

    private static Expression<Func<Invoice, InvoiceDetailResponse>> MapInvoiceDetail()
    {
        return x => new InvoiceDetailResponse
        {
            Id = x.Id,
            InvoiceNumber = x.InvoiceNumber,
            OrderId = x.OrderId,
            OrderNumber = x.Order != null ? x.Order.OrderNumber : string.Empty,
            CustomerContactId = x.CustomerContactId,
            CustomerName = x.CustomerContact != null ? x.CustomerContact.DisplayName : string.Empty,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            Subtotal = x.Subtotal,
            TaxAmount = x.TaxAmount,
            TotalAmount = x.TotalAmount,
            Status = x.Status,
            IssuedDate = x.IssuedDate,
            DueDate = x.DueDate,
            Items = x.Items.Select(item => new InvoiceItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxAmount = item.TaxAmount,
                TotalAmount = item.TotalAmount
            }).ToList()
        };
    }

    private IQueryable<Order> BuildVisibleOrdersQuery(Guid actorUserId, string role)
    {
        var query = dbContext.Orders
            .AsNoTracking()
            .Include(x => x.CustomerContact)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .Include(x => x.Items).ThenInclude(x => x.VendorUser)
            .Include(x => x.StatusHistory)
            .Include(x => x.Addresses)
            .AsQueryable();

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return role switch
        {
            "Admin" or "Staff" => query,
            "Vendor" => query.Where(x =>
                x.Items.Any(item => item.VendorUserId == actorUserId)
                || x.Items.Any(item => item.VendorUserId.HasValue
                    && dbContext.VendorUsers.Any(vendorUser =>
                        vendorUser.UserId == item.VendorUserId.Value
                        && actorVendorIds.Contains(vendorUser.VendorId)))),
            _ => query.Where(x => x.CustomerUserId == actorUserId)
        };
    }

    private IQueryable<Invoice> BuildVisibleInvoicesQuery(Guid actorUserId, string role)
    {
        var query = dbContext.Invoices
            .AsNoTracking()
            .Include(x => x.Order).ThenInclude(x => x!.Items)
            .Include(x => x.CustomerContact)
            .Include(x => x.Currency)
            .Include(x => x.Items)
            .AsQueryable();

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return role switch
        {
            "Admin" or "Staff" => query,
            "Vendor" => query.Where(x =>
                x.Order != null
                && (x.Order.Items.Any(item => item.VendorUserId == actorUserId)
                    || x.Order.Items.Any(item => item.VendorUserId.HasValue
                        && dbContext.VendorUsers.Any(vendorUser =>
                            vendorUser.UserId == item.VendorUserId.Value
                            && actorVendorIds.Contains(vendorUser.VendorId))))),
            _ => query.Where(x => x.Order != null && x.Order.CustomerUserId == actorUserId)
        };
    }

    private IQueryable<Payment> BuildVisiblePaymentsQuery(Guid actorUserId, string role)
    {
        var query = dbContext.Payments
            .AsNoTracking()
            .Include(x => x.Invoice).ThenInclude(x => x!.Order).ThenInclude(x => x!.Items)
            .Include(x => x.PaymentMode)
            .Include(x => x.Currency)
            .Include(x => x.Transactions)
            .AsQueryable();

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return role switch
        {
            "Admin" or "Staff" => query,
            "Vendor" => query.Where(x =>
                x.Invoice.Order != null
                && (x.Invoice.Order.Items.Any(item => item.VendorUserId == actorUserId)
                    || x.Invoice.Order.Items.Any(item => item.VendorUserId.HasValue
                        && dbContext.VendorUsers.Any(vendorUser =>
                            vendorUser.UserId == item.VendorUserId.Value
                            && actorVendorIds.Contains(vendorUser.VendorId))))),
            _ => query.Where(x => x.Invoice.Order != null && x.Invoice.Order.CustomerUserId == actorUserId)
        };
    }

    private IQueryable<VendorPayout> BuildVisiblePayoutsQuery(Guid actorUserId, string role)
    {
        var query = dbContext.VendorPayouts
            .AsNoTracking()
            .Include(x => x.VendorUser)
            .Include(x => x.Vendor)
            .Include(x => x.Currency)
            .Include(x => x.Items).ThenInclude(x => x.VendorEarning).ThenInclude(x => x.Order)
            .Include(x => x.Items).ThenInclude(x => x.VendorEarning).ThenInclude(x => x.Product)
            .Include(x => x.Items).ThenInclude(x => x.VendorEarning).ThenInclude(x => x.Vendor)
            .AsQueryable();

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return role == "Vendor"
            ? query.Where(x => x.VendorUserId == actorUserId || (x.VendorId.HasValue && actorVendorIds.Contains(x.VendorId.Value)))
            : query;
    }

    private async Task<Cart?> LoadCartAsync(Guid? actorUserId, string sessionId, bool includeItems, CancellationToken cancellationToken)
    {
        var query = dbContext.Carts.AsQueryable();

        if (includeItems)
        {
            query = query
                .Include(x => x.Currency)
                .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Currency)
                .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
                .Include(x => x.Items).ThenInclude(x => x.VendorUser);
        }

        return await query.SingleOrDefaultAsync(
            x => actorUserId.HasValue
                ? x.UserId == actorUserId.Value
                : x.SessionId == sessionId.Trim(),
            cancellationToken);
    }

    private async Task<Cart> ResolveCheckoutCartAsync(CreateOrderRequest request, Guid actorUserId, CancellationToken cancellationToken)
    {
        Cart? cart = null;
        if (request.CartId.HasValue)
        {
            cart = await dbContext.Carts
                .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.GstPercent)
                .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Inventory)
                .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.VendorLinks)
                .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
                .SingleOrDefaultAsync(x => x.Id == request.CartId.Value, cancellationToken);
        }

        cart ??= await dbContext.Carts
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.GstPercent)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Inventory)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.VendorLinks)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .SingleOrDefaultAsync(
                x => x.UserId == actorUserId || (!string.IsNullOrWhiteSpace(request.SessionId) && x.SessionId == request.SessionId.Trim()),
                cancellationToken);

        return cart ?? throw new InvalidOperationException("Cart was not found.");
    }

    private static void ApplyOrderAddress(Order order, OrderAddressRequest request, string fallbackType, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(request.AddressLine1) && string.IsNullOrWhiteSpace(request.City) && string.IsNullOrWhiteSpace(request.Country))
        {
            return;
        }

        order.Addresses.Add(new OrderAddress
        {
            ContactId = request.ContactId,
            AddressType = string.IsNullOrWhiteSpace(request.AddressType) ? fallbackType : request.AddressType.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            Country = request.Country.Trim(),
            PostalCode = request.PostalCode.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    private static Invoice BuildInvoice(Order order, DateTimeOffset? dueDate, DateTimeOffset now)
    {
        var invoice = new Invoice
        {
            Order = order,
            CustomerContactId = order.CustomerContactId,
            CurrencyId = order.CurrencyId,
            Subtotal = order.Subtotal,
            TaxAmount = order.TaxAmount,
            TotalAmount = order.TotalAmount,
            Status = "Issued",
            IssuedDate = now,
            DueDate = dueDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in order.Items)
        {
            invoice.Items.Add(new InvoiceItem
            {
                ProductId = item.ProductId,
                Description = item.Product.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxAmount = item.TaxAmount,
                TotalAmount = item.TotalPrice,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        return invoice;
    }

    private async Task ReserveOrderInventoryAsync(IReadOnlyList<(OrderItem OrderItem, CartItem CartItem)> orderItemPairs, DateTimeOffset now, CancellationToken cancellationToken)
    {
        foreach (var (orderItem, cartItem) in orderItemPairs)
        {
            var availableInventory = cartItem.Product.Inventory
                .Where(x => x.IsActive && x.Quantity > x.ReservedQuantity)
                .OrderBy(x => x.WarehouseId ?? int.MaxValue)
                .ThenBy(x => x.Id)
                .ToList();

            var totalAvailableInventory = availableInventory.Sum(x => x.Quantity - x.ReservedQuantity);
            if (totalAvailableInventory >= cartItem.Quantity)
            {
                var remainingQuantity = cartItem.Quantity;
                foreach (var inventory in availableInventory)
                {
                    if (remainingQuantity <= 0)
                    {
                        break;
                    }

                    var availableQuantity = inventory.Quantity - inventory.ReservedQuantity;
                    if (availableQuantity <= 0)
                    {
                        continue;
                    }

                    var reservedQuantity = Math.Min(availableQuantity, remainingQuantity);
                    inventory.ReservedQuantity += reservedQuantity;
                    inventory.UpdatedAt = now;
                    remainingQuantity -= reservedQuantity;
                    dbContext.OrderInventoryReservations.Add(new OrderInventoryReservation
                    {
                        OrderItemId = orderItem.Id,
                        ProductInventoryId = inventory.Id,
                        Quantity = reservedQuantity,
                        ReleasedQuantity = 0,
                        CreatedAt = now,
                        UpdatedAt = now
                    });
                }

                continue;
            }

            var vendorLink = cartItem.VendorUserId.HasValue
                ? cartItem.Product.VendorLinks.SingleOrDefault(x => x.VendorUserId == cartItem.VendorUserId.Value)
                : null;

            if (vendorLink is null || vendorLink.VendorInventory < cartItem.Quantity)
            {
                throw new InvalidOperationException($"Insufficient inventory for {cartItem.Product.Name}.");
            }

            vendorLink.VendorInventory -= cartItem.Quantity;
            vendorLink.UpdatedAt = now;
            dbContext.OrderInventoryReservations.Add(new OrderInventoryReservation
            {
                OrderItemId = orderItem.Id,
                VendorUserId = vendorLink.VendorUserId,
                Quantity = cartItem.Quantity,
                ReleasedQuantity = 0,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    private async Task ReleaseOrderReservationsAsync(IEnumerable<OrderItem> orderItems, IDictionary<int, int>? releaseQuantities, DateTimeOffset now, CancellationToken cancellationToken, bool includeVendorReleases = true)
    {
        var items = orderItems.ToList();
        foreach (var orderItem in items)
        {
            var quantityToRelease = orderItem.Quantity;
            if (releaseQuantities is not null && !releaseQuantities.TryGetValue(orderItem.Id, out quantityToRelease))
            {
                quantityToRelease = 0;
            }

            if (quantityToRelease <= 0)
            {
                continue;
            }

            foreach (var reservation in orderItem.InventoryReservations.Where(x => x.Quantity > x.ReleasedQuantity).OrderBy(x => x.Id))
            {
                if (quantityToRelease <= 0)
                {
                    break;
                }

                var remainingReservedQuantity = reservation.Quantity - reservation.ReleasedQuantity;
                var releasedQuantity = Math.Min(remainingReservedQuantity, quantityToRelease);
                if (releasedQuantity <= 0)
                {
                    continue;
                }

                if (reservation.ProductInventoryId.HasValue)
                {
                    var inventory = await dbContext.ProductInventory.SingleAsync(x => x.Id == reservation.ProductInventoryId.Value, cancellationToken);
                    inventory.ReservedQuantity = Math.Max(0, inventory.ReservedQuantity - releasedQuantity);
                    inventory.UpdatedAt = now;
                }
                else if (includeVendorReleases && reservation.VendorUserId.HasValue)
                {
                    var vendorLink = await dbContext.ProductVendorLinks.SingleOrDefaultAsync(
                        x => x.ProductId == orderItem.ProductId && x.VendorUserId == reservation.VendorUserId.Value,
                        cancellationToken);
                    if (vendorLink is not null)
                    {
                        vendorLink.VendorInventory += releasedQuantity;
                        vendorLink.UpdatedAt = now;
                    }
                }

                reservation.ReleasedQuantity += releasedQuantity;
                reservation.UpdatedAt = now;
                quantityToRelease -= releasedQuantity;
            }
        }
    }

    private static bool IsCancelledStatus(string status)
        => string.Equals(status, "Cancelled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Canceled", StringComparison.OrdinalIgnoreCase);

    private static bool IsExpiredStatus(string status)
        => string.Equals(status, "Expired", StringComparison.OrdinalIgnoreCase);

    private static CartResponse MapCart(Cart cart)
    {
        return new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            SessionId = cart.SessionId,
            CurrencyId = cart.CurrencyId,
            CurrencyName = cart.Currency?.Name ?? cart.Items.Select(x => x.Product.Currency?.Name).FirstOrDefault() ?? string.Empty,
            Subtotal = cart.Items.Sum(x => x.TotalPrice),
            TotalItems = cart.Items.Sum(x => x.Quantity),
            Items = cart.Items.OrderBy(x => x.Id).Select(x => new CartItemResponse
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                ProductSku = x.Product.Sku,
                ProductVariantId = x.ProductVariantId,
                ProductVariantName = x.ProductVariant?.VariantName ?? string.Empty,
                VendorUserId = x.VendorUserId,
                VendorName = x.VendorUser?.Username ?? string.Empty,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                TotalPrice = x.TotalPrice
            }).ToList()
        };
    }

    private static CartResponse CreateEmptyCartResponse(string sessionId)
    {
        return new CartResponse
        {
            SessionId = sessionId.Trim(),
            Items = [],
            TotalItems = 0,
            Subtotal = 0m
        };
    }

    private static decimal CalculateTax(Product product, int quantity, decimal unitPrice)
    {
        var percentage = product.GstPercent?.Percentage ?? 0m;
        return Math.Round((unitPrice * quantity) * percentage / 100m, 2, MidpointRounding.AwayFromZero);
    }

    private static Guid? ResolveCartVendorUserId(Guid? requestVendorUserId, Product product)
    {
        if (requestVendorUserId.HasValue)
        {
            return requestVendorUserId;
        }

        if (product.VendorUserId.HasValue)
        {
            return product.VendorUserId;
        }

        return product.VendorLinks.Select(x => x.VendorUserId).FirstOrDefault();
    }

    private static decimal ResolveUnitPrice(Product product, ProductVariant? variant, Guid? vendorUserId, int quantity, DateTimeOffset asOf)
    {
        var hasVendorContext = vendorUserId.HasValue;
        var applicablePrices = product.Prices
            .Where(price => price.IsActive && IsPriceApplicable(price, variant, quantity))
            .ToList();

        var offerPrice = applicablePrices
            .Where(price => string.Equals(price.PriceType, "Offer", StringComparison.OrdinalIgnoreCase) && IsWithinDateRange(price, asOf))
            .OrderBy(price => GetVariantPriority(price, variant))
            .ThenBy(price => GetChannelPriority(price.SalesChannel, hasVendorContext))
            .ThenByDescending(price => price.MinQuantity)
            .ThenByDescending(price => price.StartDate)
            .ThenBy(price => price.Price)
            .FirstOrDefault();

        if (offerPrice is not null)
        {
            return offerPrice.Price;
        }

        var wholesalePrice = applicablePrices
            .Where(price => string.Equals(price.PriceType, "Wholesale", StringComparison.OrdinalIgnoreCase) && IsAllowedChannel(price.SalesChannel, hasVendorContext))
            .OrderBy(price => GetVariantPriority(price, variant))
            .ThenBy(price => GetChannelPriority(price.SalesChannel, hasVendorContext))
            .ThenByDescending(price => price.MinQuantity)
            .ThenBy(price => price.Price)
            .FirstOrDefault();

        if (wholesalePrice is not null)
        {
            return wholesalePrice.Price;
        }

        if (vendorUserId.HasValue)
        {
            var vendorPrice = applicablePrices
                .Where(price => string.Equals(price.PriceType, "Vendor", StringComparison.OrdinalIgnoreCase) && IsAllowedChannel(price.SalesChannel, hasVendorContext))
                .OrderBy(price => GetVariantPriority(price, variant))
                .ThenBy(price => GetChannelPriority(price.SalesChannel, hasVendorContext))
                .ThenByDescending(price => price.MinQuantity)
                .ThenBy(price => price.Price)
                .FirstOrDefault();

            if (vendorPrice is not null)
            {
                return vendorPrice.Price;
            }

            var vendorLink = product.VendorLinks.FirstOrDefault(x => x.VendorUserId == vendorUserId.Value);
            if (vendorLink is not null && vendorLink.VendorSpecificPrice > 0)
            {
                return vendorLink.VendorSpecificPrice;
            }
        }

        var retailPrice = applicablePrices
            .Where(price => string.Equals(price.PriceType, "Retail", StringComparison.OrdinalIgnoreCase) && IsAllowedChannel(price.SalesChannel, hasVendorContext))
            .OrderBy(price => GetVariantPriority(price, variant))
            .ThenBy(price => GetChannelPriority(price.SalesChannel, hasVendorContext))
            .ThenByDescending(price => price.MinQuantity)
            .ThenBy(price => price.Price)
            .FirstOrDefault();

        if (retailPrice is not null)
        {
            return retailPrice.Price;
        }

        if (variant is not null && variant.Price > 0)
        {
            return variant.Price;
        }

        return product.BasePrice;
    }

    private static bool IsPriceApplicable(ProductPrice price, ProductVariant? variant, int quantity)
    {
        if (price.MinQuantity > quantity)
        {
            return false;
        }

        if (variant is null)
        {
            return !price.ProductVariantId.HasValue;
        }

        return !price.ProductVariantId.HasValue || price.ProductVariantId == variant.Id;
    }

    private static bool IsAllowedChannel(string salesChannel, bool hasVendorContext)
        => GetChannelPriority(salesChannel, hasVendorContext) < int.MaxValue;

    private static int GetChannelPriority(string salesChannel, bool hasVendorContext)
        => salesChannel.Trim().ToLowerInvariant() switch
        {
            "vendor" when hasVendorContext => 0,
            "marketplace" when hasVendorContext => 1,
            "online" when hasVendorContext => 2,
            "wholesale" when hasVendorContext => 3,
            "online" => 0,
            "marketplace" => 1,
            "wholesale" => 2,
            "vendor" => int.MaxValue,
            _ => int.MaxValue
        };

    private static int GetVariantPriority(ProductPrice price, ProductVariant? variant)
    {
        if (variant is not null && price.ProductVariantId == variant.Id)
        {
            return 0;
        }

        return price.ProductVariantId.HasValue ? 1 : 2;
    }

    private static bool IsWithinDateRange(ProductPrice price, DateTimeOffset asOf)
    {
        if (price.StartDate.HasValue && price.StartDate.Value > asOf)
        {
            return false;
        }

        if (price.EndDate.HasValue && price.EndDate.Value < asOf)
        {
            return false;
        }

        return true;
    }

    private static void ValidateCartIdentity(Guid? actorUserId, string sessionId)
    {
        if (!actorUserId.HasValue && string.IsNullOrWhiteSpace(sessionId))
        {
            throw new InvalidOperationException("Session id is required for guest carts.");
        }
    }

    private static bool CanAccessCart(Cart cart, Guid? actorUserId, string sessionId)
        => actorUserId.HasValue
            ? cart.UserId == actorUserId
            : cart.UserId is null
                && !string.IsNullOrWhiteSpace(sessionId)
                && string.Equals(cart.SessionId, sessionId.Trim(), StringComparison.Ordinal);

    private async Task MergeGuestCartAsync(Guid actorUserId, string sessionId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return;
        }

        var trimmedSessionId = sessionId.Trim();
        var guestCart = await dbContext.Carts
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Prices)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.VendorLinks)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Variants)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .SingleOrDefaultAsync(x => x.UserId == null && x.SessionId == trimmedSessionId, cancellationToken);

        if (guestCart is null)
        {
            return;
        }

        var actorCart = await dbContext.Carts
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Prices)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.VendorLinks)
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.Variants)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
            .SingleOrDefaultAsync(x => x.UserId == actorUserId, cancellationToken);

        var now = DateTimeOffset.UtcNow;

        if (actorCart is null)
        {
            guestCart.UserId = actorUserId;
            guestCart.UpdatedAt = now;
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        actorCart.CurrencyId ??= guestCart.CurrencyId;

        foreach (var guestItem in guestCart.Items.ToList())
        {
            var existingItem = actorCart.Items.SingleOrDefault(x =>
                x.ProductId == guestItem.ProductId
                && x.ProductVariantId == guestItem.ProductVariantId
                && x.VendorUserId == guestItem.VendorUserId);

            if (existingItem is null)
            {
                actorCart.Items.Add(new CartItem
                {
                    ProductId = guestItem.ProductId,
                    ProductVariantId = guestItem.ProductVariantId,
                    Quantity = guestItem.Quantity,
                    UnitPrice = guestItem.UnitPrice,
                    TotalPrice = guestItem.TotalPrice,
                    VendorUserId = guestItem.VendorUserId,
                    CreatedAt = now,
                    UpdatedAt = now
                });

                continue;
            }

            var mergedQuantity = existingItem.Quantity + guestItem.Quantity;
            var unitPrice = ResolveUnitPrice(guestItem.Product, guestItem.ProductVariant, guestItem.VendorUserId, mergedQuantity, now);
            existingItem.Quantity = mergedQuantity;
            existingItem.UnitPrice = unitPrice;
            existingItem.TotalPrice = unitPrice * mergedQuantity;
            existingItem.UpdatedAt = now;
        }

        actorCart.UpdatedAt = now;
        dbContext.CartItems.RemoveRange(guestCart.Items);
        dbContext.Carts.Remove(guestCart);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<int?> ResolveVendorIdAsync(Guid vendorUserId, CancellationToken cancellationToken)
        => await dbContext.VendorUsers
            .Where(x => x.UserId == vendorUserId)
            .Select(x => (int?)x.VendorId)
            .FirstOrDefaultAsync(cancellationToken);

    private async Task<PaymentSummaryResponse> RecordGatewayPaymentAsync(Invoice invoice, RazorpayPaymentResponse gatewayPayment, Guid? actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var invoiceEntity = await dbContext.Invoices
            .Include(x => x.Order)
            .ThenInclude(x => x!.StatusHistory)
            .Include(x => x.Payments)
            .ThenInclude(x => x.Transactions)
            .SingleAsync(x => x.Id == invoice.Id, cancellationToken);

        var existingPayment = invoiceEntity.Payments.FirstOrDefault(x => x.TransactionReference == gatewayPayment.Id);

        if (existingPayment is not null)
        {
            var payments = await GetPaymentsForRoleAsync(actorUserId, role, cancellationToken);
            return payments.Single(x => x.Id == existingPayment.Id);
        }

        return await PersistCompletedPaymentAsync(
            invoiceEntity,
            paymentModeId: null,
            amount: gatewayPayment.Amount / 100m,
            currencyId: invoiceEntity.CurrencyId,
            provider: "Razorpay",
            transactionReference: gatewayPayment.Id,
            actorUserId,
            role,
            ipAddress,
            cancellationToken);
    }

    private async Task<PaymentSummaryResponse> PersistCompletedPaymentAsync(
        Invoice invoice,
        int? paymentModeId,
        decimal amount,
        int? currencyId,
        string provider,
        string transactionReference,
        Guid? actorUserId,
        string role,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            PaymentModeId = paymentModeId,
            Amount = amount,
            CurrencyId = currencyId,
            Status = "Completed",
            TransactionReference = transactionReference,
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now,
            Transactions =
            [
                new PaymentTransaction
                {
                    Status = "Completed",
                    Provider = provider,
                    Reference = transactionReference,
                    Amount = amount,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            ]
        };

        dbContext.Payments.Add(payment);

        var totalPaid = invoice.Payments.Sum(x => x.Amount) + amount;
        invoice.Status = totalPaid >= invoice.TotalAmount ? "Paid" : "Partially Paid";
        invoice.UpdatedAt = now;

        if (invoice.Order is not null)
        {
            invoice.Order.PaymentStatus = totalPaid >= invoice.TotalAmount ? "Completed" : "Pending";
            if (invoice.Order.PaymentStatus == "Completed" && invoice.Order.OrderStatus == "Pending")
            {
                invoice.Order.OrderStatus = "Confirmed";
                invoice.Order.StatusHistory.Add(new OrderStatusHistory
                {
                    Status = invoice.Order.OrderStatus,
                    Notes = "Payment completed",
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            invoice.Order.UpdatedAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        if (invoice.Order is not null && invoice.Order.PaymentStatus == "Completed")
        {
            await shippingService.EnsureShipmentForOrderAsync(invoice.Order.Id, actorUserId, role, ipAddress, cancellationToken);
        }

        if (actorUserId.HasValue || role == "System")
        {
            await WriteAuditLogAsync(actorUserId, "Payment.Record", nameof(Payment), payment.Id.ToString(), ipAddress, cancellationToken);
        }

        await notificationService.QueueEventAsync(NotificationTemplateCatalog.PaymentSuccess, invoice.Order?.CustomerUserId, new Dictionary<string, string>
        {
            ["PaymentId"] = payment.Id.ToString(),
            ["OrderNumber"] = invoice.Order?.OrderNumber ?? string.Empty,
            ["Amount"] = payment.Amount.ToString("0.00"),
            ["OccurredAt"] = now.ToString("O")
        }, cancellationToken);

        var payments = await GetPaymentsForRoleAsync(actorUserId, role, cancellationToken);
        return payments.Single(x => x.Id == payment.Id);
    }

    private async Task<List<PaymentSummaryResponse>> GetPaymentsForRoleAsync(Guid? actorUserId, string role, CancellationToken cancellationToken)
    {
        if (actorUserId.HasValue)
        {
            var payments = await GetPaymentsAsync(actorUserId.Value, role, cancellationToken);
            return payments.ToList();
        }

        return await BuildVisiblePaymentsQuery(Guid.Empty, "Admin")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PaymentSummaryResponse
            {
                Id = x.Id,
                InvoiceId = x.InvoiceId,
                InvoiceNumber = x.Invoice != null ? x.Invoice.InvoiceNumber : string.Empty,
                PaymentMethodName = x.PaymentMode != null ? x.PaymentMode.Name : string.Empty,
                CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
                Amount = x.Amount,
                Status = x.Status,
                TransactionReference = x.TransactionReference,
                Provider = x.Transactions.OrderBy(transaction => transaction.Id).Select(transaction => transaction.Provider).FirstOrDefault() ?? string.Empty,
                PaidAt = x.PaidAt,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private static int ToCurrencySubunits(decimal amount)
        => (int)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

    private async Task ExpireStalePendingRazorpayOrdersAsync(CancellationToken cancellationToken)
    {
        var expiryMinutes = Math.Max(5, salesSettings.PendingPaymentExpiryMinutes);
        var cutoff = DateTimeOffset.UtcNow.AddMinutes(-expiryMinutes);

        var orders = await dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.InventoryReservations)
            .Include(x => x.StatusHistory)
            .Where(x =>
                x.PaymentProvider == "Razorpay"
                && x.CreatedAt <= cutoff
                && x.OrderStatus != "Cancelled"
                && x.OrderStatus != "Canceled"
                && x.OrderStatus != "Expired"
                && x.PaymentStatus != "Completed"
                && x.PaymentStatus != "Expired")
            .ToListAsync(cancellationToken);

        if (orders.Count == 0)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var order in orders)
        {
            await ReleaseOrderReservationsAsync(order.Items, null, now, cancellationToken);
            order.OrderStatus = "Expired";
            order.PaymentStatus = "Expired";
            order.UpdatedAt = now;
            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = order.OrderStatus,
                Notes = "Order expired before payment completion",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<bool> CanAccessOrderAsync(int orderId, Guid actorUserId, string role, CancellationToken cancellationToken)
        => await BuildVisibleOrdersQuery(actorUserId, role).AnyAsync(x => x.Id == orderId, cancellationToken);

    private async Task<bool> CanAccessInvoiceAsync(int invoiceId, Guid actorUserId, string role, CancellationToken cancellationToken)
        => await BuildVisibleInvoicesQuery(actorUserId, role).AnyAsync(x => x.Id == invoiceId, cancellationToken);

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
            Module = "Sales",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
