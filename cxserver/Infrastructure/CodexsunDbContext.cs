using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Finance.Entities;
using cxserver.Modules.System.Entities;

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
    public DbSet<Bank> Banks => Set<Bank>();
    public DbSet<PaymentMode> PaymentModes => Set<PaymentMode>();
    public DbSet<LedgerGroup> LedgerGroups => Set<LedgerGroup>();
    public DbSet<LedgerTransaction> Transactions => Set<LedgerTransaction>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<NumberSeries> NumberSeries => Set<NumberSeries>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CodexsunDbContext).Assembly);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
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
            entity.HasData(AuthSeedData.Users);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(256).IsRequired();
            entity.HasIndex(x => x.Name).IsUnique();
            entity.HasData(AuthSeedData.Roles);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(256).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();
            entity.HasData(AuthSeedData.Permissions);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(x => new { x.RoleId, x.PermissionId });
            entity.HasOne(x => x.Role)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.RoleId);
            entity.HasOne(x => x.Permission)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.PermissionId);
            entity.HasData(AuthSeedData.RolePermissions);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
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
            entity.ToTable("audit_logs");
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
