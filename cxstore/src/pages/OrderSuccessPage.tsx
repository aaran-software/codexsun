import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"

import { getOrderById } from "@/api/salesApi"
import { Button } from "@/components/ui/button"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useAuth } from "@/state/authStore"
import { formatCurrency } from "@/utils/storefront"

export default function OrderSuccessPage() {
  const { orderId = "" } = useParams()
  const [params] = useSearchParams()
  const auth = useAuth()
  const paymentMethod = params.get("payment") ?? "cod"

  const { data: order } = useQuery({
    queryKey: ["storefront", "order-success", orderId],
    queryFn: () => getOrderById(Number(orderId)),
    enabled: auth.isAuthenticated && Boolean(orderId),
  })

  usePageMeta({
    title: order ? `Order ${order.orderNumber} Confirmed` : "Order Success",
    description: "Review the completed storefront order summary.",
    canonicalPath: `/order-success/${orderId}`,
  })

  const shippingAddress = useMemo(() => order?.addresses.find((address) => address.addressType === "Shipping"), [order?.addresses])

  if (!order) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading order summary...</div>
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-[0_24px_60px_-40px_rgba(40,28,18,0.22)]">
        <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Order Confirmed</div>
        <h1 className="mt-2 text-4xl font-semibold">Thank you for your purchase</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">Your order was created through the existing backend sales workflow. Payment method selected: {paymentMethod.toUpperCase()}.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.8rem] border border-border/60 bg-card p-6">
          <div className="text-lg font-semibold">Order Summary</div>
          <div className="mt-4 grid gap-3 text-sm">
            <Row label="Order Number" value={order.orderNumber} />
            <Row label="Status" value={order.orderStatus} />
            <Row label="Payment Status" value={order.paymentStatus} />
            <Row label="Total" value={formatCurrency(order.totalAmount, order.currencyName || "INR")} />
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-border/60 bg-card p-6">
          <div className="text-lg font-semibold">Shipping Info</div>
          <div className="mt-4 text-sm text-muted-foreground">
            {shippingAddress
              ? `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} ${shippingAddress.postalCode}`
              : "Shipping details will appear here once the order carries a shipping address."}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <div className="text-lg font-semibold">Items</div>
        <div className="mt-4 grid gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-muted-foreground">{item.quantity} x {formatCurrency(item.unitPrice, order.currencyName || "INR")}</div>
              </div>
              <div className="font-medium">{formatCurrency(item.totalPrice, order.currencyName || "INR")}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link to="/account/orders" />} className="rounded-full px-5">View Orders</Button>
        <Button render={<Link to="/search" />} variant="outline" className="rounded-full px-5">Continue Shopping</Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
