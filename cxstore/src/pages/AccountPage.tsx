import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { getContacts } from "@/api/contactApi"
import { getMyReviews } from "@/api/reviewApi"
import { createReturn } from "@/api/returnsApi"
import { getOrderById, getOrders, updateOrderStatus } from "@/api/salesApi"
import { getShipments } from "@/api/shippingApi"
import { StorefrontAuthNotice } from "@/components/layout/storefront-auth-notice"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanyConfig } from "@/config/company"
import { usePageMeta } from "@/hooks/usePageMeta"
import { canRetryRazorpayPayment, launchRazorpayOrderPayment } from "@/lib/razorpay"
import { useAuth } from "@/state/authStore"
import { useWishlistStore } from "@/state/wishlistStore"
import { formatCurrency, getStoredAddresses } from "@/utils/storefront"

const tabs = [
  { label: "Overview", url: "/account" },
  { label: "Profile", url: "/account/profile" },
  { label: "Addresses", url: "/account/addresses" },
  { label: "Orders", url: "/account/orders" },
  { label: "Wishlist", url: "/account/wishlist" },
  { label: "Reviews", url: "/account/reviews" },
]

export default function AccountPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { company } = useCompanyConfig()
  const location = useLocation()
  const activeTab = tabs.find((tab) => tab.url === location.pathname)?.label ?? "Overview"
  const wishlistItems = useWishlistStore((state) => state.items)
  const hydrateWishlist = useWishlistStore((state) => state.hydrateWishlist)
  const [message, setMessage] = useState("")
  const shouldLoadOrders = auth.isAuthenticated && (activeTab === "Overview" || activeTab === "Orders")
  const shouldLoadContacts = auth.isAuthenticated && (activeTab === "Overview" || activeTab === "Profile")
  const shouldLoadReviews = auth.isAuthenticated && (activeTab === "Overview" || activeTab === "Reviews")
  const shouldLoadShipments = auth.isAuthenticated && (activeTab === "Overview" || activeTab === "Orders")

  const { data: orders = [] } = useQuery({
    queryKey: ["storefront", "account", "orders"],
    queryFn: getOrders,
    enabled: shouldLoadOrders,
    retry: false,
  })
  const { data: contacts = [] } = useQuery({
    queryKey: ["storefront", "account", "contacts"],
    queryFn: () => getContacts(false),
    enabled: shouldLoadContacts,
    retry: false,
  })
  const { data: reviews = [] } = useQuery({
    queryKey: ["storefront", "account", "reviews"],
    queryFn: getMyReviews,
    enabled: shouldLoadReviews,
    retry: false,
  })
  const { data: shipments = [] } = useQuery({
    queryKey: ["storefront", "account", "shipments"],
    queryFn: getShipments,
    enabled: shouldLoadShipments,
    retry: false,
  })

  const storedAddresses = getStoredAddresses()

  useEffect(() => {
    if (auth.isAuthenticated) {
      void hydrateWishlist()
    }
  }, [auth.isAuthenticated, hydrateWishlist])

  usePageMeta({
    title: `Account - ${activeTab}`,
    description: `Manage your customer account in the ${company.displayName} storefront.`,
    canonicalPath: location.pathname,
  })

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <StorefrontAuthNotice title="Account access requires sign-in" description="Sign in to review orders, saved products, reviews, and storefront profile details." />
      </div>
    )
  }

  const latestOrder = orders[0]
  const latestShipment = latestOrder ? shipments.find((shipment) => shipment.orderId === latestOrder.id) : undefined

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Customer Account</div>
          <h1 className="text-3xl font-semibold">{auth.user?.username}</h1>
          <p className="text-sm text-muted-foreground">{auth.user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link key={tab.url} to={tab.url} className={buttonVariants({ variant: tab.label === activeTab ? "default" : "outline", className: "rounded-full" })}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {message ? <div className="rounded-[1.4rem] border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div> : null}

      {activeTab === "Overview" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <MetricCard title="Orders" value={String(orders.length)} subtitle="Completed or in-progress orders from the sales module." />
          <MetricCard title="Wishlist" value={String(wishlistItems.length)} subtitle="Saved storefront products in your customer account." />
          <MetricCard title="Reviews" value={String(reviews.length)} subtitle="Verified product reviews submitted through the storefront backend." />
          <Card className="rounded-[1.8rem] border-border/60 lg:col-span-2">
            <CardHeader><CardTitle>Latest Order</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {latestOrder ? (
                <div className="space-y-2">
                  <div className="font-medium">{latestOrder.orderNumber}</div>
                  <div className="text-muted-foreground">{latestOrder.orderStatus} - {latestOrder.paymentStatus}</div>
                  <div>{formatCurrency(latestOrder.totalAmount, latestOrder.currencyName || "INR")}</div>
                  {latestShipment ? <div className="text-muted-foreground">Shipment: {latestShipment.status} · {latestShipment.trackingNumber}</div> : null}
                </div>
              ) : "No orders yet."}
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-border/60">
            <CardHeader><CardTitle>Saved Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {storedAddresses.length > 0 ? storedAddresses.slice(0, 3).map((address) => <div key={address}>{address}</div>) : "No checkout addresses stored yet."}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "Profile" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <MetricCard title="Username" value={auth.user?.username ?? "-"} subtitle="Sourced from the authenticated user profile." />
          <MetricCard title="Email" value={auth.user?.email ?? "-"} subtitle="Current signed-in account email." />
          <MetricCard title="Role" value={auth.user?.role ?? "-"} subtitle="Customer storefront access uses the existing auth role." />
          <MetricCard title="Contacts" value={String(contacts.length)} subtitle="Contact records visible to the signed-in user." />
        </div>
      ) : null}

      {activeTab === "Addresses" ? (
        <Card className="rounded-[1.8rem] border-border/60">
          <CardHeader><CardTitle>Address Book</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {storedAddresses.length > 0 ? storedAddresses.map((address) => (
              <div key={address} className="rounded-2xl bg-muted/40 px-4 py-3">{address}</div>
            )) : <div className="text-muted-foreground">Addresses are captured during checkout and persisted locally until a dedicated customer-address backend API is added.</div>}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Orders" ? (
        <div className="grid gap-4">
          {orders.length > 0 ? orders.map((order) => (
            <Card key={order.id} className="rounded-[1.8rem] border-border/60">
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</div>
                  <div className="text-sm text-muted-foreground">{order.orderStatus} - {order.paymentStatus}</div>
                  {shipments.find((shipment) => shipment.orderId === order.id) ? (
                    <div className="text-sm text-muted-foreground">
                      Shipment {shipments.find((shipment) => shipment.orderId === order.id)?.status} · {shipments.find((shipment) => shipment.orderId === order.id)?.trackingNumber}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">{formatCurrency(order.totalAmount, order.currencyName || "INR")}</div>
                  <Link to={`/order-success/${order.id}`} className={buttonVariants({ variant: "outline", className: "rounded-full" })}>View</Link>
                  {canRetryRazorpayPayment(order.createdAt, order.paymentMethod, order.paymentStatus, order.orderStatus) ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void launchRazorpayOrderPayment({
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        customerName: auth.user?.username,
                        customerEmail: auth.user?.email,
                        navigate,
                      }).catch((caught) => setMessage(caught instanceof Error ? caught.message : "Unable to reopen Razorpay checkout."))}
                    >
                      Pay Now
                    </Button>
                  ) : null}
                  <Button variant="outline" className="rounded-full" onClick={() => void updateOrderStatus(order.id, "Cancelled", "Customer cancelled").then(() => setMessage(`Order ${order.orderNumber} cancellation requested.`))}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => void getOrderById(order.id)
                      .then((detail) => createReturn({
                        orderId: detail.id,
                        customerContactId: detail.customerContactId ?? undefined,
                        returnReason: "Customer return request",
                        items: detail.items.map((item) => ({
                          orderItemId: item.id,
                          productId: item.productId,
                          quantity: item.quantity,
                          returnReason: "Customer return request",
                          condition: "Unknown",
                          resolutionType: "Refund",
                        })),
                      }))
                      .then(() => setMessage(`Return request submitted for ${order.orderNumber}.`))
                      .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Unable to request return."))}
                  >
                    Request Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : <div className="rounded-[1.8rem] border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">No orders found.</div>}
        </div>
      ) : null}

      {activeTab === "Wishlist" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wishlistItems.length > 0 ? wishlistItems.map((item) => (
            <Card key={item.productId} className="rounded-[1.8rem] border-border/60">
              <CardContent className="space-y-3 p-5">
                <img src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full rounded-[1.3rem] object-cover" />
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.vendorCompanyName || item.vendorName}</div>
                <Link to={`/product/${item.slug}`} className={buttonVariants({ className: "w-full rounded-full" })}>Open Product</Link>
              </CardContent>
            </Card>
          )) : <div className="rounded-[1.8rem] border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">No wishlist items saved.</div>}
        </div>
      ) : null}

      {activeTab === "Reviews" ? (
        <Card className="rounded-[1.8rem] border-border/60">
          <CardHeader><CardTitle>Your Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-muted/40 px-4 py-4">
                <div className="font-medium">{review.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{review.review}</div>
                <div className="mt-2 text-xs text-muted-foreground">{review.rating}/5 · {new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            )) : <div className="text-sm text-muted-foreground">You have not submitted any storefront reviews yet.</div>}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <Card className="rounded-[1.8rem] border-border/60">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  )
}
