import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CheckoutAddressDraft } from "@/types/storefront"

export function AddressFormCard({
  title,
  value,
  onChange,
}: {
  title: string
  value: CheckoutAddressDraft
  onChange: (next: CheckoutAddressDraft) => void
}) {
  const update = (key: keyof CheckoutAddressDraft, nextValue: string) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="rounded-[1.8rem] border border-border/60 bg-card p-5">
      <div className="mb-4 text-lg font-semibold">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name" value={value.fullName} onChange={(next) => update("fullName", next)} />
        <Field label="Phone" value={value.phone} onChange={(next) => update("phone", next)} />
        <Field label="Email" value={value.email} onChange={(next) => update("email", next)} />
        <Field label="Address Line 1" value={value.addressLine1} onChange={(next) => update("addressLine1", next)} />
        <Field label="Address Line 2" value={value.addressLine2} onChange={(next) => update("addressLine2", next)} />
        <Field label="City" value={value.city} onChange={(next) => update("city", next)} />
        <Field label="State" value={value.state} onChange={(next) => update("state", next)} />
        <Field label="Country" value={value.country} onChange={(next) => update("country", next)} />
        <Field label="Postal Code" value={value.postalCode} onChange={(next) => update("postalCode", next)} />
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
