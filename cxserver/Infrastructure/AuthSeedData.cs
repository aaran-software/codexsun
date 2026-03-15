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
    internal static readonly Guid ContactCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5");
    internal static readonly Guid ContactReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6");
    internal static readonly Guid ContactUpdatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7");
    internal static readonly Guid ContactDeletePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8");
    internal static readonly Guid ProductCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9");
    internal static readonly Guid ProductReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab0");
    internal static readonly Guid ProductUpdatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1");
    internal static readonly Guid ProductDeletePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab2");
    internal static readonly Guid OrderCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab3");
    internal static readonly Guid OrderReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab4");
    internal static readonly Guid OrderUpdatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab5");
    internal static readonly Guid InvoiceCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab6");
    internal static readonly Guid InvoiceReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab7");
    internal static readonly Guid PaymentCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab8");
    internal static readonly Guid PaymentReadPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab9");
    internal static readonly Guid VendorPayoutCreatePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac0");
    internal static readonly Guid VendorPayoutApprovePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac1");
    internal static readonly Guid InventoryViewPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac2");
    internal static readonly Guid InventoryManagePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac3");
    internal static readonly Guid InventoryTransferPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac4");
    internal static readonly Guid InventoryAdjustPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac5");
    internal static readonly Guid VendorsViewPermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6");
    internal static readonly Guid VendorsManagePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac7");
    internal static readonly Guid VendorsUsersManagePermissionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac8");

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
        new Permission { Id = UserDeletePermissionId, Code = "User.Delete", Description = "Delete users" },
        new Permission { Id = ContactCreatePermissionId, Code = "Contact.Create", Description = "Create contacts" },
        new Permission { Id = ContactReadPermissionId, Code = "Contact.Read", Description = "Read contacts" },
        new Permission { Id = ContactUpdatePermissionId, Code = "Contact.Update", Description = "Update contacts" },
        new Permission { Id = ContactDeletePermissionId, Code = "Contact.Delete", Description = "Delete contacts" },
        new Permission { Id = ProductCreatePermissionId, Code = "Product.Create", Description = "Create products" },
        new Permission { Id = ProductReadPermissionId, Code = "Product.Read", Description = "Read products" },
        new Permission { Id = ProductUpdatePermissionId, Code = "Product.Update", Description = "Update products" },
        new Permission { Id = ProductDeletePermissionId, Code = "Product.Delete", Description = "Delete products" },
        new Permission { Id = OrderCreatePermissionId, Code = "Order.Create", Description = "Create orders" },
        new Permission { Id = OrderReadPermissionId, Code = "Order.Read", Description = "Read orders" },
        new Permission { Id = OrderUpdatePermissionId, Code = "Order.Update", Description = "Update orders" },
        new Permission { Id = InvoiceCreatePermissionId, Code = "Invoice.Create", Description = "Create invoices" },
        new Permission { Id = InvoiceReadPermissionId, Code = "Invoice.Read", Description = "Read invoices" },
        new Permission { Id = PaymentCreatePermissionId, Code = "Payment.Create", Description = "Create payments" },
        new Permission { Id = PaymentReadPermissionId, Code = "Payment.Read", Description = "Read payments" },
        new Permission { Id = VendorPayoutCreatePermissionId, Code = "VendorPayout.Create", Description = "Create vendor payouts" },
        new Permission { Id = VendorPayoutApprovePermissionId, Code = "VendorPayout.Approve", Description = "Approve vendor payouts" },
        new Permission { Id = InventoryViewPermissionId, Code = "inventory.view", Description = "View inventory operations" },
        new Permission { Id = InventoryManagePermissionId, Code = "inventory.manage", Description = "Manage inventory purchase orders" },
        new Permission { Id = InventoryTransferPermissionId, Code = "inventory.transfer", Description = "Manage warehouse transfers" },
        new Permission { Id = InventoryAdjustPermissionId, Code = "inventory.adjust", Description = "Adjust warehouse inventory" },
        new Permission { Id = VendorsViewPermissionId, Code = "vendors.view", Description = "View vendor companies" },
        new Permission { Id = VendorsManagePermissionId, Code = "vendors.manage", Description = "Manage vendor companies" },
        new Permission { Id = VendorsUsersManagePermissionId, Code = "vendors.users.manage", Description = "Manage vendor user assignments" }
    ];

    internal static readonly RolePermission[] RolePermissions =
    [
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserUpdatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = UserDeletePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ContactCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ContactReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ContactUpdatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ContactDeletePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ProductCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ProductReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ProductUpdatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = ProductDeletePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = OrderCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = OrderReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = OrderUpdatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InvoiceCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InvoiceReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = PaymentCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = PaymentReadPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = VendorPayoutCreatePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = VendorPayoutApprovePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InventoryViewPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InventoryManagePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InventoryTransferPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = InventoryAdjustPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = VendorsViewPermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = VendorsManagePermissionId },
        new RolePermission { RoleId = AdminRoleId, PermissionId = VendorsUsersManagePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ContactCreatePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ContactReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ContactUpdatePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ContactDeletePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ProductCreatePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ProductReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ProductUpdatePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = ProductDeletePermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = OrderReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = InvoiceReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = PaymentReadPermissionId },
        new RolePermission { RoleId = VendorRoleId, PermissionId = VendorPayoutCreatePermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = OrderCreatePermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = OrderReadPermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = InvoiceReadPermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = PaymentCreatePermissionId },
        new RolePermission { RoleId = CustomerRoleId, PermissionId = PaymentReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = UserReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = UserUpdatePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = ContactReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = ContactUpdatePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = ProductReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = ProductUpdatePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = OrderReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = OrderUpdatePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = InvoiceReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = PaymentReadPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = VendorPayoutApprovePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = InventoryViewPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = InventoryManagePermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = InventoryTransferPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = InventoryAdjustPermissionId },
        new RolePermission { RoleId = StaffRoleId, PermissionId = VendorsViewPermissionId }
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
