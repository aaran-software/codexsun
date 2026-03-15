import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { getContacts } from "@/api/contactApi"
import { createOrder, getCart, getCartSessionId } from "@/api/salesApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/state/authStore"
import type { ContactSummary } from "@/types/contact"
import type { CreateOrderRequest } from "@/types/sales"

const initialAddress = {
  addressType: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const [contacts, setContacts] = useState<ContactSummary[]>([])
  const [form, setForm] = useState<CreateOrderRequest>({
    sessionId: getCartSessionId(),
    customerContactId: undefined,
    currencyId: undefined,
    discountAmount: 0,
    billingAddress: { ...initialAddress, addressType: "Billing" },
    shippingAddress: { ...initialAddress, addressType: "Shipping" },
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCartItems, setHasCartItems] = useState(false)

  useEffect(() => {
    void getContacts().then(setContacts).catch(() => setContacts([]))
    void getCart().then((cart) => setHasCartItems(cart.items.length > 0)).catch(() => setHasCartItems(false))
  }, [])

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Checkout Requires Login</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sign in to convert your cart into an order and generate the invoice.
          </CardContent>
          <CardFooter>
            <Button type="button" render={<Link to="/login" />} className="ml-auto">Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const order = await createOrder(form)
      const detailPath = location.pathname.startsWith("/admin")
        ? `/admin/sales/orders/${order.id}`
        : location.pathname.startsWith("/vendor")
          ? `/vendor/sales/orders/${order.id}`
          : `/orders/${order.id}`

      navigate(detailPath)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to complete checkout.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted-foreground">Create the order, invoice, and vendor earnings from the current cart.</p>
      </div>

      {error ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Contact</label>
            <Select
              value={form.customerContactId ? String(form.customerContactId) : ""}
              onValueChange={(value) => setForm((current) => ({ ...current, customerContactId: value ? Number(value) : undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={String(contact.id)}>
                    {contact.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Amount</label>
            <Input
              type="number"
              value={form.discountAmount}
              onChange={(event) => setForm((current) => ({ ...current, discountAmount: Number(event.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddressCard
          title="Billing Address"
          address={form.billingAddress}
          onChange={(field, value) => setForm((current) => ({
            ...current,
            billingAddress: { ...current.billingAddress, [field]: value },
          }))}
        />
        <AddressCard
          title="Shipping Address"
          address={form.shippingAddress}
          onChange={(field, value) => setForm((current) => ({
            ...current,
            shippingAddress: { ...current.shippingAddress, [field]: value },
          }))}
        />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={() => void handleSubmit()} disabled={submitting || !hasCartItems}>
          {submitting ? "Creating Order..." : "Create Order"}
        </Button>
      </div>
    </div>
  )
}

function AddressCard({
  title,
  address,
  onChange,
}: {
  title: string
  address: CreateOrderRequest["billingAddress"]
  onChange: (field: keyof CreateOrderRequest["billingAddress"], value: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Address Line 1" value={address.addressLine1} onChange={(value) => onChange("addressLine1", value)} />
        <Field label="Address Line 2" value={address.addressLine2} onChange={(value) => onChange("addressLine2", value)} />
        <Field label="City" value={address.city} onChange={(value) => onChange("city", value)} />
        <Field label="State" value={address.state} onChange={(value) => onChange("state", value)} />
        <Field label="Country" value={address.country} onChange={(value) => onChange("country", value)} />
        <Field label="Postal Code" value={address.postalCode} onChange={(value) => onChange("postalCode", value)} />
      </CardContent>
    </Card>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
