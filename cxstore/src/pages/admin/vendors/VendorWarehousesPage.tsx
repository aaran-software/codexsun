import { useEffect, useMemo, useState } from "react"

import { getAccessibleWarehouses } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import type { CommonMasterItem } from "@/types/common"

export default function VendorWarehousesPage() {
  const [warehouses, setWarehouses] = useState<CommonMasterItem[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    void getAccessibleWarehouses().then(setWarehouses).catch(() => setWarehouses([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return warehouses.filter((warehouse) =>
      term.length === 0
      || warehouse.name.toLowerCase().includes(term)
      || (warehouse.location ?? "").toLowerCase().includes(term)
      || (warehouse.vendorCompanyName ?? "").toLowerCase().includes(term))
  }, [warehouses, search])

  const columns: CommonListColumn<CommonMasterItem>[] = [
    { id: "name", header: "Warehouse", cell: (row) => row.name },
    { id: "location", header: "Location", cell: (row) => row.location ?? "-" },
    { id: "vendor", header: "Vendor Company", cell: (row) => row.vendorCompanyName ?? "Platform" },
    { id: "status", header: "Status", cell: (row) => row.isActive ? "Active" : "Inactive" },
  ]

  return (
    <CommonList
      header={{
        pageTitle: "Vendor Warehouses",
        pageDescription: "Review warehouses owned by your vendor company for inventory operations.",
      }}
      search={{ value: search, onChange: setSearch, placeholder: "Search warehouses" }}
      table={{ columns, data: filtered, emptyMessage: "No vendor warehouses found." }}
      footer={{ content: <span>Total warehouses: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
