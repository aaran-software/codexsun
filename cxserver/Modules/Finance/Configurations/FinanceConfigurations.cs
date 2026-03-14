using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Finance.Entities;

namespace cxserver.Modules.Finance.Configurations;

internal static class FinanceEntityConfigurationExtensions
{
    public static void ConfigureFinance<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : FinanceEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.HasIndex(x => x.IsActive);
    }

    public static void ConfigureNamed<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : NamedFinanceEntity
    {
        builder.ConfigureFinance();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Name);
    }
}

internal static class FinanceSeed
{
    internal static readonly DateTimeOffset Utc = new(2026, 03, 14, 0, 0, 0, TimeSpan.Zero);
}

public sealed class BankConfiguration : IEntityTypeConfiguration<Bank>
{
    public void Configure(EntityTypeBuilder<Bank> builder)
    {
        builder.ToTable("banks");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new Bank { Id = 1, Name = "-", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new Bank { Id = 2, Name = "State Bank of India", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new Bank { Id = 3, Name = "Bank of America", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc });
    }
}

public sealed class PaymentModeConfiguration : IEntityTypeConfiguration<PaymentMode>
{
    public void Configure(EntityTypeBuilder<PaymentMode> builder)
    {
        builder.ToTable("payment_modes");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new PaymentMode { Id = 1, Name = "-", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new PaymentMode { Id = 2, Name = "Cash", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new PaymentMode { Id = 3, Name = "Bank Transfer", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new PaymentMode { Id = 4, Name = "Card", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc });
    }
}

public sealed class LedgerGroupConfiguration : IEntityTypeConfiguration<LedgerGroup>
{
    public void Configure(EntityTypeBuilder<LedgerGroup> builder)
    {
        builder.ToTable("ledger_groups");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new LedgerGroup { Id = 1, Name = "-", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new LedgerGroup { Id = 2, Name = "Sales", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new LedgerGroup { Id = 3, Name = "Purchases", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc },
            new LedgerGroup { Id = 4, Name = "Expenses", IsActive = true, CreatedAt = FinanceSeed.Utc, UpdatedAt = FinanceSeed.Utc });
    }
}

public sealed class LedgerTransactionConfiguration : IEntityTypeConfiguration<LedgerTransaction>
{
    public void Configure(EntityTypeBuilder<LedgerTransaction> builder)
    {
        builder.ToTable("transactions");
        builder.ConfigureFinance();
        builder.Property(x => x.ReferenceNo).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TransactionDate).IsRequired();
        builder.HasIndex(x => x.ReferenceNo).IsUnique();
        builder.HasIndex(x => x.TransactionDate);
        builder.HasOne(x => x.Bank).WithMany(x => x.Transactions).HasForeignKey(x => x.BankId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.PaymentMode).WithMany(x => x.Transactions).HasForeignKey(x => x.PaymentModeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.LedgerGroup).WithMany(x => x.Transactions).HasForeignKey(x => x.LedgerGroupId).OnDelete(DeleteBehavior.Restrict);
    }
}
