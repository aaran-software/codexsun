import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { createPurchaseOrder, getPurchaseOrders, receivePurchaseOrder } from "@/api/inventoryApi"
import { listCommonItems } from "@/api/commonApi"
import { getProducts } from "@/api/productApi"
import { getUsers } from "@/api/userApi"
import { getAccessibleWarehouses } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdminUserSummary } from "@/types/admin"
import type { CommonMasterItem } from "@/types/common"
import type { PurchaseOrder } from "@/types/inventory"
import type { ProductSummary } from "@/types/product"
import { useAuth } from "@/state/authStore"

export default function PurchaseOrdersPage() {
  const auth = useAuth()
  const location = useLocation()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [vendors, setVendors] = useState<AdminUserSummary[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [currencies, setCurrencies] = useState<CommonMasterItem[]>([])
  const [warehouses, setWarehouses] = useState<CommonMasterItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedVendorId, setSelectedVendorId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedCurrencyId, setSelectedCurrencyId] = useState("")
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("0")
  const [expectedDate, setExpectedDate] = useState("")
  const [error, setError] = useState("")

  async function loadData() {
    const [purchaseOrdersResult, usersResult, productsResult, currenciesResult, warehousesResult] = await Promise.all([
      getPurchaseOrders().catch(() => []),
      isVendorRoute ? Promise.resolve([] as AdminUserSummary[]) : getUsers().catch(() => []),
      getProducts(true).catch(() => []),
      listCommonItems("/common/currencies").catch(() => []),
      (isVendorRoute ? getAccessibleWarehouses() : listCommonItems("/common/warehouses")).catch(() => []),
    ])

    setPurchaseOrders(purchaseOrdersResult)
    setVendors(usersResult.filter((user) => user.role === "Vendor" && !user.isDeleted))
    setProducts(productsResult)
    setCurrencies(currenciesResult)
    setWarehouses(warehousesResult)
  }

  useEffect(() => {
    void loadData()
  }, [isVendorRoute])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return purchaseOrders.filter((purchaseOrder) =>
      term.length === 0
      || purchaseOrder.poNumber.toLowerCase().includes(term)
      || purchaseOrder.vendorName.toLowerCase().includes(term)
      || purchaseOrder.status.toLowerCase().includes(term))
  }, [purchaseOrders, search])

  async function handleCreate() {
    setError("")

    if ((!isVendorRoute && !selectedVendorId) || !selectedProductId) {
      setError("Vendor and product are required.")
      return
    }

    try {
      await createPurchaseOrder({
        vendorUserId: isVendorRoute ? (auth.user?.id ?? "") : selectedVendorId,
        currencyId: selectedCurrencyId ? Number(selectedCurrencyId) : null,
        expectedDate: expectedDate || null,
        items: [
          {
            productId: Number(selectedProductId),
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
          },
        ],
      })

      setQuantity("1")
      setUnitPrice("0")
      setExpectedDate("")
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create purchase order.")
    }
  }

  async function handleReceive(id: number) {
    setError("")

    if (!selectedWarehouseId) {
      setError("Select a warehouse before receiving a purchase order.")
      return
    }

    try {
      await receivePurchaseOrder(id, { warehouseId: Number(selectedWarehouseId) })
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to receive purchase order.")
    }
  }

  const columns: CommonListColumn<PurchaseOrder>[] = [
    { id: "number", header: "PO Number", cell: (row) => row.poNumber },
    { id: "vendor", header: "Vendor", cell: (row) => row.vendorCompanyName || row.vendorName },
    { id: "currency", header: "Currency", cell: (row) => row.currencyName || "-" },
    { id: "amount", header: "Total", cell: (row) => row.totalAmount.toFixed(2) },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge className={row.status === "Received" ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-amber-500 text-white hover:bg-amber-500/90"}>
          {row.status}
        </Badge>
      ),
    },
    { id: "items", header: "Items", cell: (row) => row.items.length },
    {
      id: "receive",
      header: "Action",
      cell: (row) => (
        <Button size="sm" variant="outline" disabled={row.status === "Received"} onClick={() => void handleReceive(row.id)}>
          Receive
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-6">
        {!isVendorRoute ? (
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select value={selectedVendorId} onValueChange={(value) => setSelectedVendorId(value ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => <SelectItem key={vendor.id} value={vendor.id}>{vendor.username}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Vendor Scope</Label>
            <Input value={auth.user?.username ?? "Vendor"} readOnly />
          </div>
        )}
        <div className="space-y-2">
          <Label>Product</Label>
          <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={selectedCurrencyId} onValueChange={(value) => setSelectedCurrencyId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => <SelectItem key={currency.id} value={String(currency.id)}>{currency.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Expected Date</Label>
          <Input type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label>Receive Warehouse</Label>
          <Select value={selectedWarehouseId} onValueChange={(value) => setSelectedWarehouseId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select warehouse for receiving" /></SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end md:col-span-3">
          <Button onClick={() => void handleCreate()}>Create Purchase Order</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-6">{error}</p> : null}
      </section>

      <CommonList
        header={{
          pageTitle: "Purchase Orders",
          pageDescription: isVendorRoute
            ? "Create and receive purchase orders inside your vendor-company warehouse scope."
            : "Create inbound vendor purchase orders and receive stock into warehouses.",
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search purchase orders" }}
        table={{ columns, data: filtered, emptyMessage: "No purchase orders found." }}
        footer={{ content: <span>Total purchase orders: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
      />
    </div>
  )
}
