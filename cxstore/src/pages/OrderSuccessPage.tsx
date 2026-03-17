import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"

import { getOrderById, reconcileRazorpayPayment } from "@/api/salesApi"
import { getShipmentsForOrder } from "@/api/shippingApi"
import { buttonVariants } from "@/components/ui/button"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useAuth } from "@/state/authStore"
import { formatCurrency } from "@/utils/storefront"

export default function OrderSuccessPage() {
  const { orderId = "" } = useParams()
  const [params] = useSearchParams()
  const auth = useAuth()
  const paymentMethod = params.get("payment") ?? "cod"
  const paymentFlowStatus = params.get("status") ?? "created"
  const [reconcileMessage, setReconcileMessage] = useState("")

  const { data: order } = useQuery({
    queryKey: ["storefront", "order-success", orderId],
    queryFn: () => getOrderById(Number(orderId)),
    enabled: auth.isAuthenticated && Boolean(orderId),
  })
  const { data: shipments = [] } = useQuery({
    queryKey: ["storefront", "order-success", "shipments", orderId],
    queryFn: () => getShipmentsForOrder(Number(orderId)),
    enabled: auth.isAuthenticated && Boolean(orderId),
  })

  usePageMeta({
    title: order ? `Order ${order.orderNumber} Confirmed` : "Order Success",
    description: "Review the completed storefront order summary.",
    canonicalPath: `/order-success/${orderId}`,
  })

  const shippingAddress = useMemo(() => order?.addresses.find((address) => address.addressType === "Shipping"), [order?.addresses])
  const primaryShipment = shipments[0]

  useEffect(() => {
    if (!auth.isAuthenticated || !orderId || paymentMethod !== "razorpay" || paymentFlowStatus !== "pending") {
      return
    }

    void reconcileRazorpayPayment(Number(orderId))
      .then((result) => {
        if (result.paymentStatus === "Completed") {
          setReconcileMessage("Payment was confirmed from Razorpay after checkout.")
        }
      })
      .catch(() => {
        setReconcileMessage("")
      })
  }, [auth.isAuthenticated, orderId, paymentFlowStatus, paymentMethod])

  if (!order) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading order summary...</div>
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-[0_24px_60px_-40px_rgba(40,28,18,0.22)]">
        <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">{paymentFlowStatus === "paid" ? "Payment Confirmed" : "Order Received"}</div>
        <h1 className="mt-2 text-4xl font-semibold">{paymentFlowStatus === "paid" ? "Payment completed successfully" : "Your order is being held"}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          {paymentMethod === "razorpay"
            ? "Your order was created with Razorpay checkout enabled. Review the payment status below before fulfillment begins."
            : `Your order was created successfully. Payment method selected: ${paymentMethod.toUpperCase()}.`}
        </p>
        {reconcileMessage ? <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{reconcileMessage}</div> : null}
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
          {primaryShipment ? (
            <div className="mt-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm">
              <div className="font-medium">Shipment {primaryShipment.status}</div>
              <div className="text-muted-foreground">{primaryShipment.shippingMethodName} · {primaryShipment.providerName}</div>
              <div className="text-muted-foreground">Tracking: {primaryShipment.trackingNumber}</div>
            </div>
          ) : null}
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
        <Link to="/account/orders" className={buttonVariants({ className: "rounded-full px-5" })}>View Orders</Link>
        <Link to="/search" className={buttonVariants({ variant: "outline", className: "rounded-full px-5" })}>Continue Shopping</Link>
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
