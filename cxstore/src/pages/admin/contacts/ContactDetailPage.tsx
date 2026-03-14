import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getContactById } from "@/api/contactApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ContactDetail } from "@/types/contact"

export default function ContactDetailPage() {
  const params = useParams()
  const [contact, setContact] = useState<ContactDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getContactById(Number(params.id)).then(setContact)
  }, [params.id])

  if (!contact) {
    return <div className="text-sm text-muted-foreground">Loading contact...</div>
  }

  const listPath = location.pathname.startsWith("/vendor") ? "/vendor/contacts" : "/admin/contacts"

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" render={<Link to={listPath}>Back</Link>} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{contact.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {contact.isCustomer ? <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">Customer</Badge> : null}
            {contact.isSupplier ? <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">Supplier</Badge> : null}
            {contact.isVendorContact ? <Badge className="bg-violet-500 text-white hover:bg-violet-500/90">Vendor</Badge> : null}
            <Badge className={contact.isActive ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-slate-500 text-white hover:bg-slate-500/90"}>
              {contact.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="First Name" value={contact.firstName} />
            <Info label="Last Name" value={contact.lastName || "-"} />
            <Info label="Type" value={contact.contactTypeName || "-"} />
            <Info label="Group" value={contact.groupName || "-"} />
            <Info label="Primary Email" value={contact.primaryEmail || "-"} />
            <Info label="Primary Phone" value={contact.primaryPhone || "-"} />
            <Info label="Vendor" value={contact.vendorName || "-"} />
            <Info label="Tax Number" value={contact.taxNumber || "-"} />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Addresses</h3>
            {contact.addresses.map((address) => (
              <div key={address.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{address.addressType}</div>
                <div>{address.addressLine1}</div>
                {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
                <div>{[address.cityName, address.districtName, address.stateName, address.countryName, address.postalCode].filter(Boolean).join(", ")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}
