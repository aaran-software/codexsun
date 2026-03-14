using cxserver.Modules.Auth.Entities;

namespace cxserver.Infrastructure;

internal static class AuthSeedData
{
    internal static readonly Guid AdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    internal static readonly Guid VendorRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    internal static readonly Guid CustomerRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    internal static readonly Guid StaffRoleId = Guid.Parse("44444444-4444-4444-4444-444444444444");

    internal static readonly Guid SuperAdminUserId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    internal static readonly Guid ManagementUserId = Guid.Parse("66666666-6666-6666-6666-666666666666");
    internal static readonly Guid BackOfficeUserId = Guid.Parse("77777777-7777-7777-7777-777777777777");
    internal static readonly Guid StorefrontUserId = Guid.Parse("88888888-8888-8888-8888-888888888888");

    internal static readonly Guid UserCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
    internal static readonly Guid UserReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
    internal static readonly Guid UserUpdatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3");
    internal static readonly Guid UserDeletePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4");

    internal static readonly DateTimeOffset CreatedAt = new(2026, 03, 14, 0, 0, 0, TimeSpan.Zero);

    // Shared local-development password hash for seeded accounts.
    internal const string SeedPasswordHash = "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW";

    internal static readonly Role[] Roles =
    [
        new Role { Id = AdminRoleId, Name = "Admin", Description = "Platform administrators" },
        new Role { Id = VendorRoleId, Name = "Vendor", Description = "Vendor portal users" },
        new Role { Id = CustomerRoleId, Name = "Customer", Description = "Storefront customers" },
        new Role { Id = StaffRoleId, Name = "Staff", Description = "Internal staff users" }
    ];

    internal static readonly Permission[] Permissions =
    [
        new Permission { Id = UserCreatePermissionId, Code = "User.Create", Description = "Create users" },
        new Permission { Id = UserReadPermissionId, Code = "User.Read", Description = "Read users" },
        new Permission { Id = UserUpdatePermissionId, Code = "User.Update", Description = "Update users" },
        new Permission { Id = UserDeletePermissionId, Code = "User.Delete", Description = "Delete users" }
    ];

    internal static readonly RolePermission[] RolePermissions =
    [
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserUpdatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserDeletePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = UserUpdatePermissionId }
    ];

    internal static readonly User[] Users =
    [
        new User
        {
            Id = SuperAdminUserId,
            Username = "sundar",
            Email = "sundar@sundar.com",
            PasswordHash = SeedPasswordHash,
            RoleId = AdminRoleId,
            Status = "Active",
            IsDeleted = false,
            CreatedAt = CreatedAt,
            UpdatedAt = CreatedAt
        },
        new User
        {
            Id = ManagementUserId,
            Username = "management",
            Email = "management@codexsun.com",
            PasswordHash = SeedPasswordHash,
            RoleId = AdminRoleId,
            Status = "Active",
            IsDeleted = false,
            CreatedAt = CreatedAt,
            UpdatedAt = CreatedAt
        },
        new User
        {
            Id = BackOfficeUserId,
            Username = "backoffice",
            Email = "backoffice@codexsun.com",
            PasswordHash = SeedPasswordHash,
            RoleId = StaffRoleId,
            Status = "Active",
            IsDeleted = false,
            CreatedAt = CreatedAt,
            UpdatedAt = CreatedAt
        },
        new User
        {
            Id = StorefrontUserId,
            Username = "storefront",
            Email = "storefront@codexsun.com",
            PasswordHash = SeedPasswordHash,
            RoleId = CustomerRoleId,
            Status = "Active",
            IsDeleted = false,
            CreatedAt = CreatedAt,
            UpdatedAt = CreatedAt
        }
    ];
}
