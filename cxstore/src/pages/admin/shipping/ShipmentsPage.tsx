import { useEffect, useState } from "react"

import { createShipment, getShippingMethods, getShipments, updateShipmentStatus } from "@/api/shippingApi"
import { getOrders } from "@/api/salesApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OrderSummary } from "@/types/sales"
import type { Shipment, ShippingMethod } from "@/types/shipping"

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [orderId, setOrderId] = useState("")
  const [methodId, setMethodId] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [orderItemId, setOrderItemId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [statusId, setStatusId] = useState("")

  const load = async () => {
    const [shipmentResult, methodResult, orderResult] = await Promise.all([getShipments(), getShippingMethods(), getOrders()])
    setShipments(shipmentResult)
    setMethods(methodResult)
    setOrders(orderResult)
  }

  useEffect(() => {
    void load().catch(() => {
      setShipments([])
      setMethods([])
      setOrders([])
    })
  }, [])

  const columns: CommonListColumn<Shipment>[] = [
    { id: "tracking", header: "Tracking", cell: (row) => row.trackingNumber },
    { id: "order", header: "Order", cell: (row) => row.orderNumber },
    { id: "method", header: "Method", cell: (row) => row.shippingMethodName },
    { id: "provider", header: "Provider", cell: (row) => row.providerName },
    { id: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Order</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={orderId} onChange={(event) => setOrderId(event.target.value)}>
            <option value="">Select order</option>
            {orders.slice(0, 20).map((order) => <option key={order.id} value={order.id}>{order.orderNumber}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Method</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={methodId} onChange={(event) => setMethodId(event.target.value)}>
            <option value="">Select method</option>
            {methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Tracking Number</Label><Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} /></div>
        <div className="space-y-2"><Label>Order Item Id</Label><Input type="number" value={orderItemId} onChange={(event) => setOrderItemId(event.target.value)} /></div>
        <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
        <div className="flex items-end">
          <Button onClick={() => void createShipment({ orderId: Number(orderId), shippingMethodId: Number(methodId), trackingNumber, items: [{ orderItemId: Number(orderItemId), quantity: Number(quantity) }] }).then(load)}>Create Shipment</Button>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Shipment Id</Label><Input type="number" value={statusId} onChange={(event) => setStatusId(event.target.value)} /></div>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => void updateShipmentStatus(Number(statusId), { status: "Delivered" }).then(load)}>Mark Delivered</Button>
        </div>
      </section>

      <CommonList
        header={{ pageTitle: "Shipping", pageDescription: "Create outbound shipments and update delivery status." }}
        table={{ columns, data: shipments, emptyMessage: "No shipments found." }}
      />
    </div>
  )
}
