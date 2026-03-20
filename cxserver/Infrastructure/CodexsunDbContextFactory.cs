using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace cxserver.Infrastructure;

public sealed class CodexsunDbContextFactory : IDesignTimeDbContextFactory<CodexsunDbContext>
{
    public CodexsunDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("codexsun")
            ?? throw new InvalidOperationException("Connection string 'codexsun' must be configured for design-time operations.");

        var optionsBuilder = new DbContextOptionsBuilder<CodexsunDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new CodexsunDbContext(optionsBuilder.Options);
    }
}
