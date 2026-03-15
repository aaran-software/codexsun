import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { completeTransfer, createTransfer, getTransfers } from "@/api/inventoryApi"
import { listCommonItems } from "@/api/commonApi"
import { getProducts } from "@/api/productApi"
import { getAccessibleWarehouses } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommonMasterItem } from "@/types/common"
import type { ProductSummary } from "@/types/product"
import type { Transfer } from "@/types/inventory"

export default function TransfersPage() {
  const location = useLocation()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [warehouses, setWarehouses] = useState<CommonMasterItem[]>([])
  const [search, setSearch] = useState("")
  const [fromWarehouseId, setFromWarehouseId] = useState("")
  const [toWarehouseId, setToWarehouseId] = useState("")
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [error, setError] = useState("")

  async function loadData() {
    const [transfersResult, productsResult, warehousesResult] = await Promise.all([
      getTransfers().catch(() => []),
      getProducts(true).catch(() => []),
      (isVendorRoute ? getAccessibleWarehouses() : listCommonItems("/common/warehouses")).catch(() => []),
    ])

    setTransfers(transfersResult)
    setProducts(productsResult)
    setWarehouses(warehousesResult)
  }

  useEffect(() => {
    void loadData()
  }, [isVendorRoute])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return transfers.filter((transfer) =>
      term.length === 0
      || transfer.transferNumber.toLowerCase().includes(term)
      || transfer.fromWarehouseName.toLowerCase().includes(term)
      || transfer.toWarehouseName.toLowerCase().includes(term)
      || transfer.status.toLowerCase().includes(term))
  }, [transfers, search])

  async function handleCreate() {
    setError("")

    if (!fromWarehouseId || !toWarehouseId || !productId) {
      setError("From warehouse, to warehouse, and product are required.")
      return
    }

    try {
      await createTransfer({
        fromWarehouseId: Number(fromWarehouseId),
        toWarehouseId: Number(toWarehouseId),
        items: [{ productId: Number(productId), quantity: Number(quantity) }],
      })

      setQuantity("1")
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create transfer.")
    }
  }

  async function handleComplete(id: number) {
    setError("")

    try {
      await completeTransfer(id)
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete transfer.")
    }
  }

  const columns: CommonListColumn<Transfer>[] = [
    { id: "number", header: "Transfer", cell: (row) => row.transferNumber },
    { id: "from", header: "From", cell: (row) => row.fromWarehouseName },
    { id: "to", header: "To", cell: (row) => row.toWarehouseName },
    { id: "items", header: "Items", cell: (row) => row.items.length },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge className={row.status === "Completed" ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-amber-500 text-white hover:bg-amber-500/90"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: (row) => (
        <Button size="sm" variant="outline" disabled={row.status === "Completed"} onClick={() => void handleComplete(row.id)}>
          Complete
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-5">
        <div className="space-y-2">
          <Label>From Warehouse</Label>
          <Select value={fromWarehouseId} onValueChange={(value) => setFromWarehouseId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>To Warehouse</Label>
          <Select value={toWarehouseId} onValueChange={(value) => setToWarehouseId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Product</Label>
          <Select value={productId} onValueChange={(value) => setProductId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => void handleCreate()}>Create Transfer</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-5">{error}</p> : null}
      </section>

      <CommonList
        header={{
          pageTitle: "Warehouse Transfers",
          pageDescription: isVendorRoute
            ? "Move stock between warehouses owned by your vendor company."
            : "Move stock between warehouses and complete pending transfer requests.",
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search transfers" }}
        table={{ columns, data: filtered, emptyMessage: "No transfers found." }}
        footer={{ content: <span>Total transfers: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
      />
    </div>
  )
}
