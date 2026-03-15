using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.AfterSales.Entities;

namespace cxserver.Modules.AfterSales.Configurations;

internal static class AfterSalesConfigurationExtensions
{
    public static void ConfigureAfterSales<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : AfterSalesEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class ReturnConfiguration : IEntityTypeConfiguration<Return>
{
    public void Configure(EntityTypeBuilder<Return> builder)
    {
        builder.ToTable("returns");
        builder.ConfigureAfterSales();
        builder.Property(x => x.ReturnNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ReturnReason).HasMaxLength(512).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.ReturnNumber).IsUnique();
        builder.HasIndex(x => new { x.OrderId, x.Status });
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerUser).WithMany().HasForeignKey(x => x.CustomerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerContact).WithMany().HasForeignKey(x => x.CustomerContactId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ReturnItemConfiguration : IEntityTypeConfiguration<ReturnItem>
{
    public void Configure(EntityTypeBuilder<ReturnItem> builder)
    {
        builder.ToTable("return_items");
        builder.ConfigureAfterSales();
        builder.Property(x => x.ReturnReason).HasMaxLength(512).IsRequired();
        builder.Property(x => x.Condition).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.ResolutionType).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => new { x.ReturnId, x.OrderItemId }).IsUnique();
        builder.HasOne(x => x.Return).WithMany(x => x.Items).HasForeignKey(x => x.ReturnId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.OrderItem).WithMany().HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ReturnStatusHistoryConfiguration : IEntityTypeConfiguration<ReturnStatusHistory>
{
    public void Configure(EntityTypeBuilder<ReturnStatusHistory> builder)
    {
        builder.ToTable("return_status_history");
        builder.ConfigureAfterSales();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(512).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.Return).WithMany(x => x.StatusHistory).HasForeignKey(x => x.ReturnId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ReturnInspectionConfiguration : IEntityTypeConfiguration<ReturnInspection>
{
    public void Configure(EntityTypeBuilder<ReturnInspection> builder)
    {
        builder.ToTable("return_inspections");
        builder.ConfigureAfterSales();
        builder.Property(x => x.Condition).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(1024).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.ReturnItem).WithMany(x => x.Inspections).HasForeignKey(x => x.ReturnItemId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.InspectorUser).WithMany().HasForeignKey(x => x.InspectorUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RestockEventConfiguration : IEntityTypeConfiguration<RestockEvent>
{
    public void Configure(EntityTypeBuilder<RestockEvent> builder)
    {
        builder.ToTable("restock_events");
        builder.ConfigureAfterSales();
        builder.HasOne(x => x.ReturnItem).WithMany(x => x.RestockEvents).HasForeignKey(x => x.ReturnItemId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class InventoryLedgerEntryConfiguration : IEntityTypeConfiguration<InventoryLedgerEntry>
{
    public void Configure(EntityTypeBuilder<InventoryLedgerEntry> builder)
    {
        builder.ToTable("inventory_ledger");
        builder.ConfigureAfterSales();
        builder.Property(x => x.TransactionType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ReferenceNo).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(512).HasDefaultValue(string.Empty);
        builder.HasIndex(x => new { x.ProductId, x.WarehouseId, x.CreatedAt });
        builder.HasOne(x => x.ReturnItem).WithMany(x => x.InventoryLedgerEntries).HasForeignKey(x => x.ReturnItemId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.ToTable("refunds");
        builder.ConfigureAfterSales();
        builder.Property(x => x.RefundNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.RefundAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.RefundMethod).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.RefundNumber).IsUnique();
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Return).WithMany(x => x.Refunds).HasForeignKey(x => x.ReturnId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerContact).WithMany().HasForeignKey(x => x.CustomerContactId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RefundItemConfiguration : IEntityTypeConfiguration<RefundItem>
{
    public void Configure(EntityTypeBuilder<RefundItem> builder)
    {
        builder.ToTable("refund_items");
        builder.ConfigureAfterSales();
        builder.Property(x => x.RefundAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.RefundId, x.OrderItemId }).IsUnique();
        builder.HasOne(x => x.Refund).WithMany(x => x.Items).HasForeignKey(x => x.RefundId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.OrderItem).WithMany().HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RefundTransactionConfiguration : IEntityTypeConfiguration<RefundTransaction>
{
    public void Configure(EntityTypeBuilder<RefundTransaction> builder)
    {
        builder.ToTable("refund_transactions");
        builder.ConfigureAfterSales();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TransactionReference).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasOne(x => x.Refund).WithMany(x => x.Transactions).HasForeignKey(x => x.RefundId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Payment).WithMany().HasForeignKey(x => x.PaymentId).OnDelete(DeleteBehavior.Restrict);
    }
}
