namespace cxserver.Infrastructure;

public sealed class BootstrapOptions
{
    public const string SectionName = "Bootstrap";

    public bool ApplyMigrationsOnStartup { get; init; }

    public bool SeedDevelopmentUsers { get; init; }

    public string DevelopmentPassword { get; init; } = string.Empty;
}
