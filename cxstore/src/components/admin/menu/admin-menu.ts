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
    ]
  }

  return []
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
