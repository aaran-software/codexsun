import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { getContacts } from "@/api/contactApi"
import { createCustomerAddress, deleteCustomerAddress, getCustomerAddresses, updateCustomerAddress, type CustomerAddressUpsertRequest } from "@/api/customerAddressApi"
import { getMyReviews } from "@/api/reviewApi"
import { createReturn } from "@/api/returnsApi"
import { getOrderById, getOrders, updateOrderStatus } from "@/api/salesApi"
import { getShipments } from "@/api/shippingApi"
import { AddressFormCard } from "@/components/checkout/AddressFormCard"
import { StorefrontAuthNotice } from "@/components/layout/storefront-auth-notice"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanyConfig } from "@/config/company"
import { usePageMeta } from "@/hooks/usePageMeta"
import { canRetryRazorpayPayment, launchRazorpayOrderPayment } from "@/lib/razorpay"
import { useAuth } from "@/state/authStore"
import { useWishlistStore } from "@/state/wishlistStore"
import type { CheckoutAddressDraft } from "@/types/storefront"
import { formatCurrency } from "@/utils/storefront"

const tabs = [
  { label: "Overview", url: "/account" },
  { label: "Profile", url: "/account/profile" },
  { label: "Addresses", url: "/account/addresses" },
  { label: "Orders", url: "/account/orders" },
  { label: "Wishlist", url: "/account/wishlist" },
  { label: "Reviews", url: "/account/reviews" },
]

const blankAddress: CheckoutAddressDraft = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
}

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
  const shouldLoadAddresses = auth.isAuthenticated && (activeTab === "Overview" || activeTab === "Addresses")
  const [addressForm, setAddressForm] = useState<CheckoutAddressDraft>({ ...blankAddress })
  const [addressLabel, setAddressLabel] = useState("Primary")
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [isDefaultAddress, setIsDefaultAddress] = useState(true)

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
  const { data: customerAddresses = [], refetch: refetchCustomerAddresses } = useQuery({
    queryKey: ["storefront", "customer-addresses"],
    queryFn: getCustomerAddresses,
    enabled: shouldLoadAddresses,
    retry: false,
  })

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
  const resetAddressForm = () => {
    setAddressForm({ ...blankAddress, email: auth.user?.email ?? "", fullName: auth.user?.username ?? "" })
    setAddressLabel("Primary")
    setEditingAddressId(null)
    setIsDefaultAddress(true)
  }

  const mapAddressRequest = (): CustomerAddressUpsertRequest => ({
    label: addressLabel,
    fullName: addressForm.fullName,
    phone: addressForm.phone,
    email: addressForm.email,
    addressLine1: addressForm.addressLine1,
    addressLine2: addressForm.addressLine2,
    city: addressForm.city,
    state: addressForm.state,
    country: addressForm.country,
    postalCode: addressForm.postalCode,
    isDefault: isDefaultAddress,
  })

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
              {customerAddresses.length > 0 ? customerAddresses.slice(0, 3).map((address) => <div key={address.id}>{address.label}: {address.addressLine1}, {address.city}, {address.state}, {address.postalCode}</div>) : "No saved addresses yet."}
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
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[1.8rem] border-border/60">
            <CardHeader><CardTitle>Address Book</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {customerAddresses.length > 0 ? customerAddresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium">{address.label}{address.isDefault ? " · Default" : ""}</div>
                      <div>{address.fullName}</div>
                      <div className="text-muted-foreground">{address.phone} · {address.email}</div>
                      <div className="text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.state}, {address.country} - {address.postalCode}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setEditingAddressId(address.id)
                          setAddressLabel(address.label)
                          setIsDefaultAddress(address.isDefault)
                          setAddressForm({
                            fullName: address.fullName,
                            phone: address.phone,
                            email: address.email,
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            postalCode: address.postalCode,
                          })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void deleteCustomerAddress(address.id)
                          .then(() => refetchCustomerAddresses())
                          .then(() => {
                            setMessage("Address removed.")
                            if (editingAddressId === address.id) {
                              resetAddressForm()
                            }
                          })
                          .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Unable to delete address."))}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )) : <div className="text-muted-foreground">No saved addresses yet.</div>}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="rounded-[1.8rem] border-border/60">
              <CardHeader><CardTitle>{editingAddressId ? "Edit Address" : "Add Address"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Label</span>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} />
                  </label>
                  <label className="mt-7 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isDefaultAddress} onChange={(event) => setIsDefaultAddress(event.target.checked)} />
                    <span>Set as default address</span>
                  </label>
                </div>
                <AddressFormCard title="Customer Address" value={addressForm} onChange={setAddressForm} />
                <div className="flex flex-wrap justify-end gap-2">
                  {editingAddressId ? <Button variant="outline" className="rounded-full" onClick={resetAddressForm}>Cancel</Button> : null}
                  <Button
                    className="rounded-full"
                    onClick={() => void (editingAddressId
                      ? updateCustomerAddress(editingAddressId, mapAddressRequest())
                      : createCustomerAddress(mapAddressRequest()))
                      .then(() => refetchCustomerAddresses())
                      .then(() => {
                        setMessage(editingAddressId ? "Address updated." : "Address saved.")
                        resetAddressForm()
                      })
                      .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Unable to save address."))}
                  >
                    {editingAddressId ? "Update Address" : "Save Address"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
