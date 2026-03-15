import { useEffect, useState } from "react"

import { getOrders } from "@/api/salesApi"
import { approveReturn, createReturn, getRefunds, getReturns, processRefund } from "@/api/returnsApi"
import { getAccessibleWarehouses } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CommonMasterItem } from "@/types/common"
import type { OrderSummary } from "@/types/sales"
import type { RefundSummary, ReturnSummary } from "@/types/returns"

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnSummary[]>([])
  const [refunds, setRefunds] = useState<RefundSummary[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [warehouses, setWarehouses] = useState<CommonMasterItem[]>([])
  const [orderId, setOrderId] = useState("")
  const [orderItemId, setOrderItemId] = useState("")
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [reason, setReason] = useState("")
  const [approveId, setApproveId] = useState("")
  const [refundReturnId, setRefundReturnId] = useState("")
  const [refundWarehouseId, setRefundWarehouseId] = useState("")

  const load = async () => {
    const [returnResult, refundResult, orderResult, warehouseResult] = await Promise.all([getReturns(), getRefunds(), getOrders(), getAccessibleWarehouses()])
    setReturns(returnResult)
    setRefunds(refundResult)
    setOrders(orderResult)
    setWarehouses(warehouseResult)
  }

  useEffect(() => {
    void load().catch(() => {
      setReturns([])
      setRefunds([])
      setOrders([])
      setWarehouses([])
    })
  }, [])

  const returnColumns: CommonListColumn<ReturnSummary>[] = [
    { id: "number", header: "Return", cell: (row) => row.returnNumber },
    { id: "order", header: "Order", cell: (row) => row.orderNumber },
    { id: "customer", header: "Customer", cell: (row) => row.customerName },
    { id: "status", header: "Status", cell: (row) => row.status },
  ]

  const refundColumns: CommonListColumn<RefundSummary>[] = [
    { id: "number", header: "Refund", cell: (row) => row.refundNumber },
    { id: "return", header: "Return", cell: (row) => row.returnNumber || "-" },
    { id: "amount", header: "Amount", cell: (row) => row.refundAmount.toFixed(2) },
    { id: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Order</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={orderId} onChange={(event) => setOrderId(event.target.value)}>
            <option value="">Select order</option>
            {orders.slice(0, 20).map((order) => <option key={order.id} value={order.id}>{order.orderNumber}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Order Item Id</Label><Input type="number" value={orderItemId} onChange={(event) => setOrderItemId(event.target.value)} /></div>
        <div className="space-y-2"><Label>Product Id</Label><Input type="number" value={productId} onChange={(event) => setProductId(event.target.value)} /></div>
        <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
        <div className="space-y-2 md:col-span-3"><Label>Reason</Label><Input value={reason} onChange={(event) => setReason(event.target.value)} /></div>
        <div className="flex items-end">
          <Button onClick={() => void createReturn({ orderId: Number(orderId), returnReason: reason, items: [{ orderItemId: Number(orderItemId), productId: Number(productId), quantity: Number(quantity), returnReason: reason, condition: "Returned", resolutionType: "Refund" }] }).then(load)}>Create Return</Button>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Approve Return Id</Label><Input type="number" value={approveId} onChange={(event) => setApproveId(event.target.value)} /></div>
        <div className="flex items-end"><Button variant="outline" onClick={() => void approveReturn(Number(approveId), { notes: "Approved from admin page." }).then(load)}>Approve Return</Button></div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Refund Return Id</Label><Input type="number" value={refundReturnId} onChange={(event) => setRefundReturnId(event.target.value)} /></div>
        <div className="space-y-2">
          <Label>Warehouse</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={refundWarehouseId} onChange={(event) => setRefundWarehouseId(event.target.value)}>
            <option value="">Select warehouse</option>
            {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => void processRefund({ returnId: Number(refundReturnId), warehouseId: refundWarehouseId ? Number(refundWarehouseId) : null, amount: 0, transactionReference: `MANUAL-${refundReturnId}`, status: "Processed" }).then(load)}>Process Refund</Button>
        </div>
      </section>

      <CommonList header={{ pageTitle: "Returns", pageDescription: "Approve returns and manage refund-ready requests." }} table={{ columns: returnColumns, data: returns, emptyMessage: "No returns found." }} />
      <CommonList header={{ pageTitle: "Refunds", pageDescription: "Review processed refunds linked to returns." }} table={{ columns: refundColumns, data: refunds, emptyMessage: "No refunds found." }} />
    </div>
  )
}
