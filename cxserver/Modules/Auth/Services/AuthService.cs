using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.DTOs;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Auth.Security;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.Services;

namespace cxserver.Modules.Auth.Services;

public sealed class AuthService(
    CodexsunDbContext dbContext,
    PasswordService passwordService,
    JwtTokenService jwtTokenService,
    IOptions<JwtSettings> jwtOptions,
    NotificationService notificationService)
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public async Task<TokenResponse> RegisterAsync(RegisterRequest request, string ipAddress, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        var exists = await dbContext.Users.AnyAsync(
            x => x.Username == username || x.Email == email,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A user with the same username or email already exists.");
        }

        var customerRole = await dbContext.Roles.SingleAsync(x => x.Name == "Customer", cancellationToken);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = passwordService.HashPassword(request.Password),
            RoleId = customerRole.Id,
            Status = "Active",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        await WriteAuditLogAsync(user.Id, "Auth.Register", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);
        await notificationService.QueueEventAsync(NotificationTemplateCatalog.UserRegistration, user.Id, new Dictionary<string, string>
        {
            ["Username"] = user.Username,
            ["Email"] = user.Email,
            ["OccurredAt"] = DateTimeOffset.UtcNow.ToString("O")
        }, cancellationToken);

        return await IssueTokensAsync(user.Id, ipAddress, cancellationToken);
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken)
    {
        var normalized = request.UsernameOrEmail.Trim().ToLowerInvariant();
        var user = await dbContext.Users
            .Include(x => x.Role)
            .ThenInclude(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .SingleOrDefaultAsync(
                x => x.Username.ToLower() == normalized || x.Email.ToLower() == normalized,
                cancellationToken);

        if (user is null || user.IsDeleted || !passwordService.VerifyPassword(request.Password, user.PasswordHash) || user.Status != "Active")
        {
            await WriteAuditLogAsync(null, "Auth.LoginFailed", nameof(User), null, ipAddress, cancellationToken);
            throw new UnauthorizedAccessException("Invalid username/email or password.");
        }

        await WriteAuditLogAsync(user.Id, "Auth.Login", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);

        return await IssueTokensForLoadedUserAsync(user, ipAddress, cancellationToken);
    }

    public async Task<TokenResponse> RefreshAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken)
    {
        var existingToken = await dbContext.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x.Role)
            .ThenInclude(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .SingleOrDefaultAsync(x => x.Token == refreshToken, cancellationToken);

        if (existingToken is null || !existingToken.IsActive || existingToken.User.IsDeleted || existingToken.User.Status != "Active")
        {
            throw new UnauthorizedAccessException("Refresh token is invalid or expired.");
        }

        existingToken.RevokedAt = DateTimeOffset.UtcNow;

        var tokenResponse = await IssueTokensForLoadedUserAsync(existingToken.User, ipAddress, cancellationToken);
        await WriteAuditLogAsync(existingToken.UserId, "Auth.Refresh", nameof(RefreshToken), existingToken.Id.ToString(), ipAddress, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return tokenResponse;
    }

    public async Task LogoutAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken)
    {
        var existingToken = await dbContext.RefreshTokens
            .SingleOrDefaultAsync(x => x.Token == refreshToken, cancellationToken);

        if (existingToken is null)
        {
            return;
        }

        if (existingToken.RevokedAt is null)
        {
            existingToken.RevokedAt = DateTimeOffset.UtcNow;
            await WriteAuditLogAsync(existingToken.UserId, "Auth.Logout", nameof(RefreshToken), existingToken.Id.ToString(), ipAddress, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<object?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(x => x.Role)
            .ThenInclude(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user is null)
        {
            return null;
        }

        return new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Status,
            user.IsDeleted,
            Role = user.Role.Name,
            Permissions = user.Role.RolePermissions.Select(x => x.Permission.Code).OrderBy(x => x).ToArray()
        };
    }

    public async Task<IReadOnlyList<UserListItemResponse>> GetUsersAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .OrderBy(x => x.Username)
            .Select(x => new UserListItemResponse
            {
                Id = x.Id,
                Username = x.Username,
                Email = x.Email,
                Role = x.Role.Name,
                Status = x.Status,
                IsDeleted = x.IsDeleted,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<UserDetailResponse?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x => x.Id == userId)
            .Select(x => new UserDetailResponse
            {
                Id = x.Id,
                Username = x.Username,
                Email = x.Email,
                RoleId = x.RoleId,
                Role = x.Role.Name,
                Status = x.Status,
                IsDeleted = x.IsDeleted,
                CreatedAt = x.CreatedAt
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<UserDetailResponse> CreateUserAsync(CreateUserRequest request, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Username, email, password, and role are required.");
        }

        var duplicateUserExists = await dbContext.Users.AnyAsync(
            x => x.Username == username || x.Email == email,
            cancellationToken);

        if (duplicateUserExists)
        {
            throw new InvalidOperationException("A user with the same username or email already exists.");
        }

        var role = await dbContext.Roles.SingleOrDefaultAsync(x => x.Id == request.RoleId, cancellationToken)
            ?? throw new InvalidOperationException("Role not found.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = passwordService.HashPassword(request.Password),
            RoleId = role.Id,
            Status = "Active",
            IsDeleted = false,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        await WriteAuditLogAsync(actorUserId, "Auth.UserCreate", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);

        return (await GetUserByIdAsync(user.Id, cancellationToken))!;
    }

    public async Task<UserDetailResponse?> UpdateUserAsync(Guid userId, UpdateUserRequest request, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Email is required.");
        }

        var duplicateEmailExists = await dbContext.Users.AnyAsync(
            x => x.Id != userId && x.Email == email,
            cancellationToken);

        if (duplicateEmailExists)
        {
            throw new InvalidOperationException("A user with the same email already exists.");
        }

        var role = await dbContext.Roles.SingleOrDefaultAsync(x => x.Id == request.RoleId, cancellationToken)
            ?? throw new InvalidOperationException("Role not found.");

        user.Email = email;
        user.RoleId = role.Id;
        user.Status = string.IsNullOrWhiteSpace(request.Status) ? user.Status : request.Status.Trim();
        user.UpdatedAt = DateTimeOffset.UtcNow;

        var passwordChanged = !string.IsNullOrWhiteSpace(request.Password);
        if (passwordChanged)
        {
            user.PasswordHash = passwordService.HashPassword(request.Password!);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.UserUpdate", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);
        if (passwordChanged)
        {
            await notificationService.QueueEventAsync(NotificationTemplateCatalog.PasswordReset, user.Id, new Dictionary<string, string>
            {
                ["Username"] = user.Username,
                ["Email"] = user.Email,
                ["OccurredAt"] = DateTimeOffset.UtcNow.ToString("O")
            }, cancellationToken);
        }

        return await GetUserByIdAsync(user.Id, cancellationToken);
    }

    public async Task<bool> SoftDeleteUserAsync(Guid userId, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.IsDeleted = true;
        user.Status = "Deleted";
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.UserDelete", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task<bool> RestoreUserAsync(Guid userId, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.IsDeleted = false;
        user.Status = "Active";
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.UserRestore", nameof(User), user.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<RoleListItemResponse>> GetRolesAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Roles
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new RoleListItemResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                UserCount = x.Users.Count(user => !user.IsDeleted)
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<RoleDetailResponse?> GetRoleByIdAsync(Guid roleId, CancellationToken cancellationToken)
    {
        return await dbContext.Roles
            .AsNoTracking()
            .Where(x => x.Id == roleId)
            .Select(x => new RoleDetailResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<RoleDetailResponse> CreateRoleAsync(CreateRoleRequest request, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(request.Description))
        {
            throw new InvalidOperationException("Role name and description are required.");
        }

        var duplicateExists = await dbContext.Roles.AnyAsync(x => x.Name == name, cancellationToken);
        if (duplicateExists)
        {
            throw new InvalidOperationException("A role with the same name already exists.");
        }

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = request.Description.Trim()
        };

        dbContext.Roles.Add(role);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.RoleCreate", nameof(Role), role.Id.ToString(), ipAddress, cancellationToken);
        return (await GetRoleByIdAsync(role.Id, cancellationToken))!;
    }

    public async Task<RoleDetailResponse?> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles.SingleOrDefaultAsync(x => x.Id == roleId, cancellationToken);
        if (role is null)
        {
            return null;
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(request.Description))
        {
            throw new InvalidOperationException("Role name and description are required.");
        }

        var duplicateExists = await dbContext.Roles.AnyAsync(x => x.Id != roleId && x.Name == name, cancellationToken);
        if (duplicateExists)
        {
            throw new InvalidOperationException("A role with the same name already exists.");
        }

        role.Name = name;
        role.Description = request.Description.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.RoleUpdate", nameof(Role), role.Id.ToString(), ipAddress, cancellationToken);
        return await GetRoleByIdAsync(role.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<PermissionResponse>> GetPermissionsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Permissions
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .Select(x => new PermissionResponse
            {
                Id = x.Id,
                Code = x.Code,
                Description = x.Description
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>?> GetRolePermissionIdsAsync(Guid roleId, CancellationToken cancellationToken)
    {
        var roleExists = await dbContext.Roles.AnyAsync(x => x.Id == roleId, cancellationToken);
        if (!roleExists)
        {
            return null;
        }

        return await dbContext.RolePermissions
            .AsNoTracking()
            .Where(x => x.RoleId == roleId)
            .Select(x => x.PermissionId)
            .OrderBy(x => x)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> UpdateRolePermissionsAsync(Guid roleId, IReadOnlyCollection<Guid> permissionIds, Guid? actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles
            .Include(x => x.RolePermissions)
            .SingleOrDefaultAsync(x => x.Id == roleId, cancellationToken);

        if (role is null)
        {
            return false;
        }

        var distinctPermissionIds = permissionIds.Distinct().ToArray();
        var validPermissionIds = await dbContext.Permissions
            .Where(x => distinctPermissionIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToArrayAsync(cancellationToken);

        if (validPermissionIds.Length != distinctPermissionIds.Length)
        {
            throw new InvalidOperationException("One or more permissions do not exist.");
        }

        var existingPermissionIds = role.RolePermissions.Select(x => x.PermissionId).ToHashSet();
        var toRemove = role.RolePermissions.Where(x => !distinctPermissionIds.Contains(x.PermissionId)).ToList();
        var toAdd = distinctPermissionIds.Where(x => !existingPermissionIds.Contains(x)).ToArray();

        dbContext.RolePermissions.RemoveRange(toRemove);
        foreach (var permissionId in toAdd)
        {
            dbContext.RolePermissions.Add(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Auth.RolePermissionsUpdate", nameof(Role), roleId.ToString(), ipAddress, cancellationToken);
        return true;
    }

    private async Task<TokenResponse> IssueTokensAsync(Guid userId, string ipAddress, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(x => x.Role)
            .ThenInclude(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .SingleAsync(x => x.Id == userId, cancellationToken);

        return await IssueTokensForLoadedUserAsync(user, ipAddress, cancellationToken);
    }

    private async Task<TokenResponse> IssueTokensForLoadedUserAsync(User user, string ipAddress, CancellationToken cancellationToken)
    {
        var permissions = user.Role.RolePermissions
            .Select(x => x.Permission.Code)
            .Distinct()
            .OrderBy(x => x)
            .ToArray();

        var (accessToken, expiresAt) = jwtTokenService.GenerateAccessToken(user, permissions);
        var refreshToken = jwtTokenService.GenerateRefreshToken();

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenDays),
            CreatedAt = DateTimeOffset.UtcNow,
            IpAddress = ipAddress
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };
    }

    private async Task WriteAuditLogAsync(
        Guid? userId,
        string action,
        string entityType,
        string? entityId,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
