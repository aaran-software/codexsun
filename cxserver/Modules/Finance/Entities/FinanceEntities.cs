namespace cxserver.Modules.Finance.Entities;

public abstract class FinanceEntity
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public abstract class NamedFinanceEntity : FinanceEntity
{
    public string Name { get; set; } = string.Empty;
}

public sealed class Bank : NamedFinanceEntity
{
    public ICollection<LedgerTransaction> Transactions { get; set; } = [];
}

public sealed class PaymentMode : NamedFinanceEntity
{
    public ICollection<LedgerTransaction> Transactions { get; set; } = [];
}

public sealed class LedgerGroup : NamedFinanceEntity
{
    public ICollection<LedgerTransaction> Transactions { get; set; } = [];
}

public sealed class LedgerTransaction : FinanceEntity
{
    public string ReferenceNo { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTimeOffset TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? BankId { get; set; }
    public Bank? Bank { get; set; }
    public int? PaymentModeId { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public int? LedgerGroupId { get; set; }
    public LedgerGroup? LedgerGroup { get; set; }
}
