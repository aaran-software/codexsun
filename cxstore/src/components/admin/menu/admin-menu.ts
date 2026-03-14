export type AdminMenuItem = {
  title: string
  url: string
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
    {
      title: "Cities",
      url: "/admin/common/cities",
    },
    {
      title: "States",
      url: "/admin/common/states",
    },
    {
      title: "Product Types",
      url: "/admin/common/product-types",
    },
    {
      title: "Units",
      url: "/admin/common/units",
    },
    {
      title: "Brands",
      url: "/admin/common/brands",
    },
  ]
}
