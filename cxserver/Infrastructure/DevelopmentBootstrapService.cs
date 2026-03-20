using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Auth.Security;

namespace cxserver.Infrastructure;

public sealed class DevelopmentBootstrapService(
    IOptions<BootstrapOptions> bootstrapOptions,
    PasswordHasher passwordHasher)
{
    public async Task SeedDevelopmentUsersAsync(CodexsunDbContext dbContext, CancellationToken cancellationToken)
    {
        var options = bootstrapOptions.Value;
        if (!options.SeedDevelopmentUsers)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(options.DevelopmentPassword))
        {
            throw new InvalidOperationException("Bootstrap:DevelopmentPassword is required when seeding development users.");
        }

        var existingUsers = await dbContext.Users
            .Where(user => AuthSeedData.DevelopmentUserIds.Contains(user.Id))
            .ToListAsync(cancellationToken);

        var seededUsers = AuthSeedData.CreateDevelopmentUsers(passwordHasher.HashPassword(options.DevelopmentPassword));
        var existingUsersById = existingUsers.ToDictionary(user => user.Id);
        var missingUsers = new List<User>();

        foreach (var seededUser in seededUsers)
        {
            if (existingUsersById.TryGetValue(seededUser.Id, out var existingUser))
            {
                existingUser.Username = seededUser.Username;
                existingUser.Email = seededUser.Email;
                existingUser.PasswordHash = seededUser.PasswordHash;
                existingUser.RoleId = seededUser.RoleId;
                existingUser.Status = seededUser.Status;
                existingUser.IsDeleted = false;
                existingUser.UpdatedAt = DateTimeOffset.UtcNow;
                continue;
            }

            missingUsers.Add(seededUser);
        }

        if (missingUsers.Count == 0 && existingUsers.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        if (missingUsers.Count > 0)
        {
            await dbContext.Users.AddRangeAsync(missingUsers, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
