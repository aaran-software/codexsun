import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { adjustInventory, getProductInventory, getWarehouseInventory } from "@/api/inventoryApi"
import { listCommonItems } from "@/api/commonApi"
import { getProducts } from "@/api/productApi"
import { getAccessibleWarehouses } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommonMasterItem } from "@/types/common"
import type { InventorySummary } from "@/types/inventory"
import type { ProductSummary } from "@/types/product"

export default function InventoryPage() {
  const location = useLocation()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const [inventory, setInventory] = useState<InventorySummary[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [warehouses, setWarehouses] = useState<CommonMasterItem[]>([])
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState("warehouse")
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [adjustWarehouseId, setAdjustWarehouseId] = useState("")
  const [adjustProductId, setAdjustProductId] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustQuantity, setAdjustQuantity] = useState("0")
  const [error, setError] = useState("")

  async function loadLookups() {
    const [productsResult, warehousesResult] = await Promise.all([
      getProducts(true).catch(() => []),
      (isVendorRoute ? getAccessibleWarehouses() : listCommonItems("/common/warehouses")).catch(() => []),
    ])

    setProducts(productsResult)
    setWarehouses(warehousesResult)

    if (!selectedWarehouseId && warehousesResult.length > 0) {
      setSelectedWarehouseId(String(warehousesResult[0].id))
      setAdjustWarehouseId(String(warehousesResult[0].id))
    }

    if (!selectedProductId && productsResult.length > 0) {
      setSelectedProductId(String(productsResult[0].id))
      setAdjustProductId(String(productsResult[0].id))
    }
  }

  async function loadInventory(nextMode = viewMode, warehouseId = selectedWarehouseId, productId = selectedProductId) {
    if (nextMode === "warehouse" && warehouseId) {
      setInventory(await getWarehouseInventory(Number(warehouseId)).catch(() => []))
      return
    }

    if (nextMode === "product" && productId) {
      setInventory(await getProductInventory(Number(productId)).catch(() => []))
      return
    }

    setInventory([])
  }

  useEffect(() => {
    void loadLookups()
  }, [isVendorRoute])

  useEffect(() => {
    void loadInventory()
  }, [viewMode, selectedWarehouseId, selectedProductId])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return inventory.filter((item) =>
      term.length === 0
      || item.productName.toLowerCase().includes(term)
      || item.productSku.toLowerCase().includes(term)
      || item.warehouseName.toLowerCase().includes(term))
  }, [inventory, search])

  async function handleAdjustInventory() {
    setError("")

    if (!adjustWarehouseId || !adjustProductId || !adjustReason.trim()) {
      setError("Warehouse, product, and reason are required.")
      return
    }

    try {
      await adjustInventory({
        warehouseId: Number(adjustWarehouseId),
        reason: adjustReason,
        items: [
          {
            productId: Number(adjustProductId),
            newQuantity: Number(adjustQuantity),
          },
        ],
      })

      await loadInventory()
      setAdjustReason("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to adjust inventory.")
    }
  }

  const columns: CommonListColumn<InventorySummary>[] = [
    { id: "product", header: "Product", cell: (row) => row.productName },
    { id: "sku", header: "SKU", cell: (row) => row.productSku },
    { id: "warehouse", header: "Warehouse", cell: (row) => row.warehouseName },
    { id: "onHand", header: "On Hand", cell: (row) => row.quantityOnHand },
    { id: "reserved", header: "Reserved", cell: (row) => row.reservedQuantity },
    { id: "available", header: "Available", cell: (row) => row.availableQuantity },
    { id: "reorder", header: "Reorder Level", cell: (row) => row.reorderLevel },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-6">
        <div className="space-y-2">
          <Label>View Mode</Label>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value ?? "warehouse")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse">By Warehouse</SelectItem>
              <SelectItem value="product">By Product</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Warehouse Filter</Label>
          <Select value={selectedWarehouseId} onValueChange={(value) => setSelectedWarehouseId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Product Filter</Label>
          <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Adjustment Warehouse</Label>
          <Select value={adjustWarehouseId} onValueChange={(value) => setAdjustWarehouseId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Adjustment Product</Label>
          <Select value={adjustProductId} onValueChange={(value) => setAdjustProductId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>New Quantity</Label>
          <Input type="number" min="0" value={adjustQuantity} onChange={(event) => setAdjustQuantity(event.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-4">
          <Label>Adjustment Reason</Label>
          <Input value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} placeholder="Explain the adjustment" />
        </div>
        <div className="flex items-end md:col-span-2">
          <Button onClick={() => void handleAdjustInventory()}>Adjust Inventory</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-6">{error}</p> : null}
      </section>

      <CommonList
        header={{
          pageTitle: "Warehouse Inventory",
          pageDescription: isVendorRoute
            ? "Review stock only for warehouses owned by your vendor company and perform scoped adjustments."
            : "Review current stock snapshots by warehouse or by product and perform controlled adjustments.",
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search inventory" }}
        table={{ columns, data: filtered, emptyMessage: "No inventory records found." }}
        footer={{ content: <span>Total inventory rows: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
      />
    </div>
  )
}
