import { commonMenuItems } from "@/lib/common-master-registry"

export type AdminMenuItem = {
  title: string
  url: string
}

export function getMasterMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role === "Admin") {
    return [
      {
        title: "Contacts",
        url: "/admin/contacts",
      },
      {
        title: "Products",
        url: "/admin/products",
      },
    ]
  }

  if (role === "Vendor") {
    return [
      {
        title: "Contacts",
        url: "/vendor/contacts",
      },
      {
        title: "Products",
        url: "/vendor/products",
      },
      {
        title: "Warehouses",
        url: "/vendor/warehouses",
      },
    ]
  }

  return []
}

export function getSalesMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role === "Admin") {
    return [
      { title: "Orders", url: "/admin/sales/orders" },
      { title: "Invoices", url: "/admin/sales/invoices" },
      { title: "Payments", url: "/admin/sales/payments" },
      { title: "Vendor Payouts", url: "/admin/sales/vendor-payouts" },
    ]
  }

  if (role === "Vendor") {
    return [
      { title: "Orders", url: "/vendor/sales/orders" },
      { title: "Invoices", url: "/vendor/sales/invoices" },
      { title: "Payments", url: "/vendor/sales/payments" },
      { title: "Vendor Payouts", url: "/vendor/sales/vendor-payouts" },
    ]
  }

  return []
}

export function getInventoryMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role === "Admin") {
    return [
      { title: "Purchase Orders", url: "/admin/inventory/purchase-orders" },
      { title: "Transfers", url: "/admin/inventory/transfers" },
      { title: "Warehouse Inventory", url: "/admin/inventory/warehouse" },
      { title: "Stock Movements", url: "/admin/inventory/movements" },
    ]
  }

  if (role === "Vendor") {
    return [
      { title: "Purchase Orders", url: "/vendor/inventory/purchase-orders" },
      { title: "Transfers", url: "/vendor/inventory/transfers" },
      { title: "Warehouse Inventory", url: "/vendor/inventory/warehouse" },
      { title: "Stock Movements", url: "/vendor/inventory/movements" },
    ]
  }

  return []
}

export function getVendorMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Vendors", url: "/admin/vendors" },
  ]
}

export function getAdminMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return role === "Vendor"
      ? [
          {
            title: "Vendor Console",
            url: "/vendor",
          },
        ]
      : [
          {
            title: "Preferences",
            url: "/dashboard",
          },
        ]
  }

  return [
    {
      title: "Admin Console",
      url: "/admin",
    },
    {
      title: "Users",
      url: "/admin/users",
    },
    {
      title: "Roles",
      url: "/admin/roles",
    },
    {
      title: "Permissions",
      url: "/admin/permissions",
    },
  ]
}

export function getCommonMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    {
      title: "Product Categories",
      url: "/admin/common/product-categories",
    },
    ...commonMenuItems,
  ]
}
