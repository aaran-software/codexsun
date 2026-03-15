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

export function getPromotionMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Promotions", url: "/admin/promotions" },
  ]
}

export function getShippingMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Shipments", url: "/admin/shipping" },
  ]
}

export function getReturnsMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Returns", url: "/admin/returns" },
  ]
}

export function getAnalyticsMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Analytics", url: "/admin/analytics" },
  ]
}

export function getMediaMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Media Library", url: "/admin/media" },
  ]
}

export function getSettingsMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Company", url: "/admin/settings/company" },
  ]
}

export function getNotificationMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Templates", url: "/admin/notifications/templates" },
    { title: "Logs", url: "/admin/notifications/logs" },
    { title: "Settings", url: "/admin/notifications/settings" },
  ]
}

export function getMonitoringMenuItems(role: string | undefined): AdminMenuItem[] {
  if (role !== "Admin") {
    return []
  }

  return [
    { title: "Audit Logs", url: "/admin/monitoring/audit-logs" },
    { title: "System Logs", url: "/admin/monitoring/system-logs" },
    { title: "Error Logs", url: "/admin/monitoring/error-logs" },
    { title: "Login History", url: "/admin/monitoring/login-history" },
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
