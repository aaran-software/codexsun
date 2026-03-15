import { useEffect, useState, type ReactNode } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { getOrderById, updateOrderStatus } from "@/api/salesApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderDetail } from "@/types/sales"

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getOrderById(Number(params.id)).then(setOrder)
  }, [params.id])

  if (!order) {
    return <div className="text-sm text-muted-foreground">Loading order...</div>
  }

  const listPath = location.pathname.startsWith("/vendor")
    ? "/vendor/sales/orders"
    : location.pathname.startsWith("/account")
      ? "/account/orders"
      : "/admin/sales/orders"

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => void updateOrderStatus(order.id, "Processing").then(setOrder)}>Mark Processing</Button>
        <Button type="button" variant="outline" onClick={() => navigate(listPath)}>Back</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{order.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">{order.orderStatus}</Badge>
            <Badge className={order.paymentStatus === "Completed" ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-amber-500 text-white hover:bg-amber-500/90"}>
              {order.paymentStatus}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Info label="Customer" value={order.customerName || "-"} />
            <Info label="Subtotal" value={order.subtotal.toFixed(2)} />
            <Info label="Tax" value={order.taxAmount.toFixed(2)} />
            <Info label="Total" value={order.totalAmount.toFixed(2)} />
          </div>
          <Section title="Items">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{item.productName}</div>
                <div className="text-muted-foreground">{item.productSku}{item.productVariantName ? ` • ${item.productVariantName}` : ""}</div>
                <div className="mt-2">Qty {item.quantity} • Unit {item.unitPrice.toFixed(2)} • Total {item.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </Section>
          <Section title="Addresses">
            {order.addresses.map((address) => (
              <div key={address.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{address.addressType}</div>
                <div>{address.addressLine1}</div>
                {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
                <div>{[address.city, address.state, address.country, address.postalCode].filter(Boolean).join(", ")}</div>
              </div>
            ))}
          </Section>
          <Section title="Status History">
            {order.statusHistory.map((item) => (
              <div key={item.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{item.status}</div>
                <div className="text-muted-foreground">{item.notes || "-"}</div>
              </div>
            ))}
          </Section>
        </CardContent>
      </Card>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-3"><h3 className="font-medium">{title}</h3>{children}</div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="space-y-1"><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div>{value}</div></div>
}
