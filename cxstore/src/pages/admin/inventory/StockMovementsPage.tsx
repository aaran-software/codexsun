import { useEffect, useMemo, useState } from "react"

import { getStockMovements } from "@/api/inventoryApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import type { StockMovement } from "@/types/inventory"

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    void getStockMovements().then(setMovements).catch(() => setMovements([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return movements.filter((movement) =>
      term.length === 0
      || movement.productName.toLowerCase().includes(term)
      || movement.warehouseName.toLowerCase().includes(term)
      || movement.movementType.toLowerCase().includes(term)
      || movement.referenceType.toLowerCase().includes(term))
  }, [movements, search])

  const columns: CommonListColumn<StockMovement>[] = [
    { id: "product", header: "Product", cell: (row) => row.productName },
    { id: "warehouse", header: "Warehouse", cell: (row) => row.warehouseName },
    {
      id: "movementType",
      header: "Movement",
      cell: (row) => <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">{row.movementType}</Badge>,
    },
    { id: "quantity", header: "Quantity", cell: (row) => row.quantity },
    { id: "reference", header: "Reference", cell: (row) => `${row.referenceType} #${row.referenceId}` },
    { id: "actor", header: "Created By", cell: (row) => row.createdByUsername },
  ]

  return (
    <CommonList
      header={{
        pageTitle: "Stock Movements",
        pageDescription: "Track inbound, outbound, adjustment, and transfer movement history across warehouses.",
      }}
      search={{ value: search, onChange: setSearch, placeholder: "Search stock movements" }}
      table={{ columns, data: filtered, emptyMessage: "No stock movements found." }}
      footer={{ content: <span>Total movements: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
