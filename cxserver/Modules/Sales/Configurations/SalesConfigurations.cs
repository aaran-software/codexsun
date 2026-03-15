using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Sales.Entities;

namespace cxserver.Modules.Sales.Configurations;

internal static class SalesConfigurationExtensions
{
    public static void ConfigureSales<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : SalesEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("carts");
        builder.ConfigureSales();
        builder.Property(x => x.SessionId).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.SessionId);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("cart_items");
        builder.ConfigureSales();
        builder.Property(x => x.UnitPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.CartId, x.ProductId, x.ProductVariantId, x.VendorUserId }).IsUnique();
        builder.HasOne(x => x.Cart).WithMany(x => x.Items).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductVariant).WithMany().HasForeignKey(x => x.ProductVariantId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.ConfigureSales();
        builder.Property(x => x.OrderNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.OrderStatus).HasMaxLength(32).IsRequired();
        builder.Property(x => x.PaymentStatus).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Subtotal).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TaxAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.DiscountAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => x.OrderNumber).IsUnique();
        builder.HasIndex(x => x.CustomerUserId);
        builder.HasIndex(x => x.OrderStatus);
        builder.HasOne(x => x.CustomerUser).WithMany().HasForeignKey(x => x.CustomerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerContact).WithMany().HasForeignKey(x => x.CustomerContactId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");
        builder.ConfigureSales();
        builder.Property(x => x.UnitPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TaxAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.OrderId, x.ProductId, x.ProductVariantId, x.VendorUserId });
        builder.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductVariant).WithMany().HasForeignKey(x => x.ProductVariantId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("order_status_history");
        builder.ConfigureSales();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(512).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.Order).WithMany(x => x.StatusHistory).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class OrderAddressConfiguration : IEntityTypeConfiguration<OrderAddress>
{
    public void Configure(EntityTypeBuilder<OrderAddress> builder)
    {
        builder.ToTable("order_addresses");
        builder.ConfigureSales();
        builder.Property(x => x.AddressType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.AddressLine1).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AddressLine2).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.City).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.State).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.Country).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.PostalCode).HasMaxLength(32).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.Order).WithMany(x => x.Addresses).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Contact).WithMany().HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");
        builder.ConfigureSales();
        builder.Property(x => x.InvoiceNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Subtotal).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TaxAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.InvoiceNumber).IsUnique();
        builder.HasOne(x => x.Order).WithMany(x => x.Invoices).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerContact).WithMany().HasForeignKey(x => x.CustomerContactId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.ToTable("invoice_items");
        builder.ConfigureSales();
        builder.Property(x => x.Description).HasMaxLength(512).IsRequired();
        builder.Property(x => x.UnitPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TaxAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasOne(x => x.Invoice).WithMany(x => x.Items).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");
        builder.ConfigureSales();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.TransactionReference).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.Invoice).WithMany(x => x.Payments).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.PaymentMode).WithMany().HasForeignKey(x => x.PaymentModeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("payment_transactions");
        builder.ConfigureSales();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Provider).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.Reference).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasOne(x => x.Payment).WithMany(x => x.Transactions).HasForeignKey(x => x.PaymentId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class VendorEarningConfiguration : IEntityTypeConfiguration<VendorEarning>
{
    public void Configure(EntityTypeBuilder<VendorEarning> builder)
    {
        builder.ToTable("vendor_earnings");
        builder.ConfigureSales();
        builder.Property(x => x.SaleAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.CommissionAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.VendorAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.IsSettled).HasDefaultValue(false);
        builder.HasIndex(x => new { x.VendorUserId, x.IsSettled });
        builder.HasIndex(x => x.VendorId);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.OrderItem).WithMany(x => x.VendorEarnings).HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VendorPayoutConfiguration : IEntityTypeConfiguration<VendorPayout>
{
    public void Configure(EntityTypeBuilder<VendorPayout> builder)
    {
        builder.ToTable("vendor_payouts");
        builder.ConfigureSales();
        builder.Property(x => x.PayoutNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.PayoutNumber).IsUnique();
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VendorPayoutItemConfiguration : IEntityTypeConfiguration<VendorPayoutItem>
{
    public void Configure(EntityTypeBuilder<VendorPayoutItem> builder)
    {
        builder.ToTable("vendor_payout_items");
        builder.ConfigureSales();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.VendorPayoutId, x.VendorEarningId }).IsUnique();
        builder.HasOne(x => x.VendorPayout).WithMany(x => x.Items).HasForeignKey(x => x.VendorPayoutId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.VendorEarning).WithMany(x => x.PayoutItems).HasForeignKey(x => x.VendorEarningId).OnDelete(DeleteBehavior.Restrict);
    }
}
