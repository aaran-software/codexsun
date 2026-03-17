using Microsoft.EntityFrameworkCore;
using cxserver.Modules.AfterSales.Entities;
using cxserver.Modules.Analytics.Entities;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Company.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Contacts.Entities;
using cxserver.Modules.Finance.Entities;
using cxserver.Modules.Inventory.Entities;
using cxserver.Modules.Media.Entities;
using cxserver.Modules.Monitoring.Entities;
using cxserver.Modules.Notifications.Entities;
using cxserver.Modules.Promotions.Entities;
using cxserver.Modules.Products.Entities;
using cxserver.Modules.Sales.Entities;
using cxserver.Modules.Shipping.Entities;
using cxserver.Modules.Storefront.Entities;
using cxserver.Modules.System.Entities;
using cxserver.Modules.Vendors.Entities;

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
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyAddress> CompanyAddresses => Set<CompanyAddress>();
    public DbSet<CompanySetting> CompanySettings => Set<CompanySetting>();
    public DbSet<ContactGroup> ContactGroups => Set<ContactGroup>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<ContactAddress> ContactAddresses => Set<ContactAddress>();
    public DbSet<ContactEmail> ContactEmails => Set<ContactEmail>();
    public DbSet<ContactPhone> ContactPhones => Set<ContactPhone>();
    public DbSet<ContactNote> ContactNotes => Set<ContactNote>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductPrice> ProductPrices => Set<ProductPrice>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductInventory> ProductInventory => Set<ProductInventory>();
    public DbSet<ProductVendorLink> ProductVendorLinks => Set<ProductVendorLink>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderInventoryReservation> OrderInventoryReservations => Set<OrderInventoryReservation>();
    public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();
    public DbSet<OrderAddress> OrderAddresses => Set<OrderAddress>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<VendorEarning> VendorEarnings => Set<VendorEarning>();
    public DbSet<VendorPayout> VendorPayouts => Set<VendorPayout>();
    public DbSet<VendorPayoutItem> VendorPayoutItems => Set<VendorPayoutItem>();
    public DbSet<Bank> Banks => Set<Bank>();
    public DbSet<PaymentMode> PaymentModes => Set<PaymentMode>();
    public DbSet<LedgerGroup> LedgerGroups => Set<LedgerGroup>();
    public DbSet<LedgerTransaction> Transactions => Set<LedgerTransaction>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<NumberSeries> NumberSeries => Set<NumberSeries>();
    public DbSet<InventoryLedger> InventoryLedgers => Set<InventoryLedger>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<WarehouseTransfer> WarehouseTransfers => Set<WarehouseTransfer>();
    public DbSet<WarehouseTransferItem> WarehouseTransferItems => Set<WarehouseTransferItem>();
    public DbSet<InventoryAdjustment> InventoryAdjustments => Set<InventoryAdjustment>();
    public DbSet<InventoryAdjustmentItem> InventoryAdjustmentItems => Set<InventoryAdjustmentItem>();
    public DbSet<MediaFolder> MediaFolders => Set<MediaFolder>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<MediaUsage> MediaUsage => Set<MediaUsage>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<LoginHistory> LoginHistory => Set<LoginHistory>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorUser> VendorUsers => Set<VendorUser>();
    public DbSet<VendorAddress> VendorAddresses => Set<VendorAddress>();
    public DbSet<VendorBankAccount> VendorBankAccounts => Set<VendorBankAccount>();
    public DbSet<VendorSalesSummary> VendorSalesSummaries => Set<VendorSalesSummary>();
    public DbSet<ProductSalesSummary> ProductSalesSummaries => Set<ProductSalesSummary>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PromotionProduct> PromotionProducts => Set<PromotionProduct>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<ShippingProvider> ShippingProviders => Set<ShippingProvider>();
    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<ShipmentItem> ShipmentItems => Set<ShipmentItem>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<ReturnItem> ReturnItems => Set<ReturnItem>();
    public DbSet<ReturnStatusHistory> ReturnStatusHistoryEntries => Set<ReturnStatusHistory>();
    public DbSet<ReturnInspection> ReturnInspections => Set<ReturnInspection>();
    public DbSet<RestockEvent> RestockEvents => Set<RestockEvent>();
    public DbSet<InventoryLedgerEntry> ReturnInventoryLedgerEntries => Set<InventoryLedgerEntry>();
    public DbSet<Refund> Refunds => Set<Refund>();
    public DbSet<RefundItem> RefundItems => Set<RefundItem>();
    public DbSet<RefundTransaction> RefundTransactions => Set<RefundTransaction>();
    public DbSet<WishlistEntry> WishlistEntries => Set<WishlistEntry>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();

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
            entity.Property(x => x.Module).HasMaxLength(100).HasDefaultValue(string.Empty);
            entity.Property(x => x.OldValues).HasColumnType("text").HasDefaultValue(string.Empty);
            entity.Property(x => x.NewValues).HasColumnType("text").HasDefaultValue(string.Empty);
            entity.Property(x => x.IpAddress).HasMaxLength(128).IsRequired();
            entity.Property(x => x.UserAgent).HasMaxLength(500).HasDefaultValue(string.Empty);
            entity.HasIndex(x => x.CreatedAt);
            entity.HasIndex(x => x.Action);
            entity.HasIndex(x => x.Module);
            entity.HasOne(x => x.User)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
