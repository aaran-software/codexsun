using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.Sales.Services;

public sealed partial class SalesService(CodexsunDbContext dbContext, NotificationService notificationService)
{
    private const decimal VendorCommissionRate = 0.10m;

    public async Task<CartResponse> GetCartAsync(Guid? actorUserId, string sessionId, CancellationToken cancellationToken)
    {
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

    public async Task<CartResponse?> UpdateCartItemAsync(int itemId, CartItemUpdateRequest request, Guid? actorUserId, CancellationToken cancellationToken)
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

        if (item is null || !CanAccessCart(item.Cart, actorUserId))
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

    public async Task<bool> RemoveCartItemAsync(int itemId, Guid? actorUserId, CancellationToken cancellationToken)
    {
        var item = await dbContext.CartItems
            .Include(x => x.Cart)
            .SingleOrDefaultAsync(x => x.Id == itemId, cancellationToken);

        if (item is null || !CanAccessCart(item.Cart, actorUserId))
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
        return await BuildVisibleOrdersQuery(actorUserId, role)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapOrderSummary())
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderDetailResponse?> GetOrderByIdAsync(int orderId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisibleOrdersQuery(actorUserId, role)
            .Where(x => x.Id == orderId)
            .Select(MapOrderDetail())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<OrderDetailResponse> CreateOrderAsync(CreateOrderRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
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
        var order = new Order
        {
            OrderNumber = await GenerateDocumentNumberAsync("ORD", dbContext.Orders.Select(x => x.OrderNumber), cancellationToken),
            CustomerUserId = role == "Customer" ? actorUserId : null,
            CustomerContactId = request.CustomerContactId,
            CurrencyId = request.CurrencyId ?? cart.CurrencyId ?? cart.Items.Select(x => x.Product.CurrencyId).FirstOrDefault(),
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

            order.Items.Add(new OrderItem
            {
                ProductId = cartItem.ProductId,
                ProductVariantId = cartItem.ProductVariantId,
                VendorUserId = cartItem.VendorUserId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice,
                TaxAmount = itemTax,
                TotalPrice = cartItem.TotalPrice + itemTax,
                CreatedAt = now,
                UpdatedAt = now
            });
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

        dbContext.Orders.Add(order);
        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(cancellationToken);

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
            .SingleOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null || !await CanAccessOrderAsync(order.Id, actorUserId, role, cancellationToken))
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        order.OrderStatus = request.Status.Trim();
        order.UpdatedAt = now;
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = order.OrderStatus,
            Notes = request.Notes.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });

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
                PaidAt = x.PaidAt,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PaymentSummaryResponse> RecordPaymentAsync(RecordPaymentRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
        {
            throw new InvalidOperationException("Payment amount must be greater than zero.");
        }

        var invoice = await dbContext.Invoices
            .Include(x => x.Order)
            .Include(x => x.Payments)
            .SingleOrDefaultAsync(x => x.Id == request.InvoiceId, cancellationToken);

        if (invoice is null || !await CanAccessInvoiceAsync(invoice.Id, actorUserId, role, cancellationToken))
        {
            throw new InvalidOperationException("Invoice was not found.");
        }

        var now = DateTimeOffset.UtcNow;
        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            PaymentModeId = request.PaymentModeId,
            Amount = request.Amount,
            CurrencyId = request.CurrencyId ?? invoice.CurrencyId,
            Status = "Completed",
            TransactionReference = request.TransactionReference.Trim(),
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now,
            Transactions =
            [
                new PaymentTransaction
                {
                    Status = "Completed",
                    Provider = request.Provider.Trim(),
                    Reference = request.TransactionReference.Trim(),
                    Amount = request.Amount,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            ]
        };

        dbContext.Payments.Add(payment);

        var totalPaid = invoice.Payments.Sum(x => x.Amount) + request.Amount;
        invoice.Status = totalPaid >= invoice.TotalAmount ? "Paid" : "Partially Paid";
        invoice.UpdatedAt = now;

        if (invoice.Order is not null)
        {
            invoice.Order.PaymentStatus = totalPaid >= invoice.TotalAmount ? "Completed" : "Pending";
            invoice.Order.UpdatedAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Payment.Record", nameof(Payment), payment.Id.ToString(), ipAddress, cancellationToken);
        await notificationService.QueueEventAsync(NotificationTemplateCatalog.PaymentSuccess, invoice.Order?.CustomerUserId, new Dictionary<string, string>
        {
            ["PaymentId"] = payment.Id.ToString(),
            ["OrderNumber"] = invoice.Order?.OrderNumber ?? string.Empty,
            ["Amount"] = payment.Amount.ToString("0.00"),
            ["OccurredAt"] = now.ToString("O")
        }, cancellationToken);
        return (await GetPaymentsAsync(actorUserId, role, cancellationToken)).Single(x => x.Id == payment.Id);
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
                .Include(x => x.Items).ThenInclude(x => x.ProductVariant)
                .SingleOrDefaultAsync(x => x.Id == request.CartId.Value, cancellationToken);
        }

        cart ??= await dbContext.Carts
            .Include(x => x.Items).ThenInclude(x => x.Product).ThenInclude(x => x.GstPercent)
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

    private static bool CanAccessCart(Cart cart, Guid? actorUserId)
        => actorUserId.HasValue ? cart.UserId == actorUserId : !string.IsNullOrWhiteSpace(cart.SessionId);

    private async Task<int?> ResolveVendorIdAsync(Guid vendorUserId, CancellationToken cancellationToken)
        => await dbContext.VendorUsers
            .Where(x => x.UserId == vendorUserId)
            .Select(x => (int?)x.VendorId)
            .FirstOrDefaultAsync(cancellationToken);

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
