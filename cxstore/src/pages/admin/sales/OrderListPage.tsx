import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { getOrders } from "@/api/salesApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import type { OrderSummary } from "@/types/sales"

export default function OrderListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    void getOrders().then(setOrders).catch(() => setOrders([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) =>
      term.length === 0
      || order.orderNumber.toLowerCase().includes(term)
      || order.customerName.toLowerCase().includes(term)
      || order.orderStatus.toLowerCase().includes(term))
  }, [orders, search])

  const basePath = location.pathname.startsWith("/vendor")
    ? "/vendor/sales/orders"
    : location.pathname.startsWith("/account")
      ? "/account/orders"
      : "/admin/sales/orders"
  const columns: CommonListColumn<OrderSummary>[] = [
    {
      id: "number",
      header: "Order",
      cell: (row) => (
        <button type="button" className="font-medium text-primary" onClick={() => navigate(`${basePath}/${row.id}`)}>
          {row.orderNumber}
        </button>
      ),
    },
    { id: "customer", header: "Customer", cell: (row) => row.customerName || "-" },
    { id: "amount", header: "Total", cell: (row) => row.totalAmount.toFixed(2) },
    { id: "items", header: "Items", cell: (row) => row.itemCount },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">{row.orderStatus}</Badge>
          <Badge className={row.paymentStatus === "Completed" ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-amber-500 text-white hover:bg-amber-500/90"}>
            {row.paymentStatus}
          </Badge>
        </div>
      ),
    },
  ]

  return (
    <CommonList
      header={{
        pageTitle: location.pathname.startsWith("/vendor") ? "My Orders" : "Orders",
        pageDescription: "Track storefront, wholesale, and vendor order flows in one place.",
        addLabel: "New Order",
        onAddClick: () => navigate(`${basePath}/create`),
      }}
      search={{ value: search, onChange: setSearch, placeholder: "Search orders" }}
      table={{ columns, data: filtered, emptyMessage: "No orders found." }}
      footer={{ content: <span>Total orders: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
