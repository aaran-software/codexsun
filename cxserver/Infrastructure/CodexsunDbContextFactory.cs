using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace cxserver.Infrastructure;

public sealed class CodexsunDbContextFactory : IDesignTimeDbContextFactory<CodexsunDbContext>
{
    public CodexsunDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CodexsunDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=7025;Database=codexsun;Username=cxadmin;Password=DbPass1@@");

        return new CodexsunDbContext(optionsBuilder.Options);
    }
}
