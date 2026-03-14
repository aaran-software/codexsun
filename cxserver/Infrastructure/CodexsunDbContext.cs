using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;

namespace cxserver.Infrastructure;

public sealed class CodexsunDbContext(DbContextOptions<CodexsunDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<State> States => Set<State>();
    public DbSet<District> Districts => Set<District>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Pincode> Pincodes => Set<Pincode>();
    public DbSet<ContactType> ContactTypes => Set<ContactType>();
    public DbSet<ProductType> ProductTypes => Set<ProductType>();
    public DbSet<ProductGroup> ProductGroups => Set<ProductGroup>();
    public DbSet<HsnCode> HsnCodes => Set<HsnCode>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<GstPercent> GstPercents => Set<GstPercent>();
    public DbSet<Colour> Colours => Set<Colour>();
    public DbSet<Size> Sizes => Set<Size>();
    public DbSet<OrderType> OrderTypes => Set<OrderType>();
    public DbSet<Style> Styles => Set<Style>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<PaymentTerm> PaymentTerms => Set<PaymentTerm>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CodexsunDbContext).Assembly);

        var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var vendorRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var customerRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var staffRoleId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var superAdminUserId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var superAdminCreatedAt = new DateTimeOffset(2026, 03, 14, 0, 0, 0, TimeSpan.Zero);
        const string superAdminPasswordHash = "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW";

        var userCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
        var userReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
        var userUpdatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3");
        var userDeletePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4");

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("auth_users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Username).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Username).IsUnique();
            entity.HasOne(x => x.Role)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasData(
                new User
                {
                    Id = superAdminUserId,
                    Username = "sundar",
                    Email = "sundar@sundar.com",
                    PasswordHash = superAdminPasswordHash,
                    RoleId = adminRoleId,
                    Status = "Active",
                    IsDeleted = false,
                    CreatedAt = superAdminCreatedAt,
                    UpdatedAt = superAdminCreatedAt
                });
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("auth_roles");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(256).IsRequired();
            entity.HasIndex(x => x.Name).IsUnique();

            entity.HasData(
                new Role { Id = adminRoleId, Name = "Admin", Description = "Platform administrators" },
                new Role { Id = vendorRoleId, Name = "Vendor", Description = "Vendor portal users" },
                new Role { Id = customerRoleId, Name = "Customer", Description = "Storefront customers" },
                new Role { Id = staffRoleId, Name = "Staff", Description = "Internal staff users" });
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("auth_permissions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(256).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();

            entity.HasData(
                new Permission { Id = userCreatePermissionId, Code = "User.Create", Description = "Create users" },
                new Permission { Id = userReadPermissionId, Code = "User.Read", Description = "Read users" },
                new Permission { Id = userUpdatePermissionId, Code = "User.Update", Description = "Update users" },
                new Permission { Id = userDeletePermissionId, Code = "User.Delete", Description = "Delete users" });
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("auth_role_permissions");
            entity.HasKey(x => new { x.RoleId, x.PermissionId });
            entity.HasOne(x => x.Role)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.RoleId);
            entity.HasOne(x => x.Permission)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.PermissionId);

            entity.HasData(
                new RolePermission { RoleId = adminRoleId, PermissionId = userCreatePermissionId },
                new RolePermission { RoleId = adminRoleId, PermissionId = userReadPermissionId },
                new RolePermission { RoleId = adminRoleId, PermissionId = userUpdatePermissionId },
                new RolePermission { RoleId = adminRoleId, PermissionId = userDeletePermissionId },
                new RolePermission { RoleId = vendorRoleId, PermissionId = userReadPermissionId },
                new RolePermission { RoleId = customerRoleId, PermissionId = userReadPermissionId },
                new RolePermission { RoleId = staffRoleId, PermissionId = userReadPermissionId },
                new RolePermission { RoleId = staffRoleId, PermissionId = userUpdatePermissionId });
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("auth_refresh_tokens");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Token).HasMaxLength(512).IsRequired();
            entity.Property(x => x.IpAddress).HasMaxLength(128).IsRequired();
            entity.HasIndex(x => x.Token).IsUnique();
            entity.HasIndex(x => new { x.UserId, x.ExpiresAt });
            entity.HasOne(x => x.User)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("auth_audit_logs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Action).HasMaxLength(128).IsRequired();
            entity.Property(x => x.EntityType).HasMaxLength(128).IsRequired();
            entity.Property(x => x.EntityId).HasMaxLength(128);
            entity.Property(x => x.IpAddress).HasMaxLength(128).IsRequired();
            entity.HasIndex(x => x.CreatedAt);
            entity.HasIndex(x => x.Action);
            entity.HasOne(x => x.User)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
