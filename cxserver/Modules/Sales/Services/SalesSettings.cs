namespace cxserver.Modules.Sales.Services;

public sealed class SalesSettings
{
    public const string SectionName = "Sales";

    public int PendingPaymentExpiryMinutes { get; set; } = 30;
}
