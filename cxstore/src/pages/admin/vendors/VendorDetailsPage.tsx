import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getVendorById, updateVendor } from "@/api/vendorApi"
import { MediaPicker } from "@/components/media/MediaPicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VendorDetail } from "@/types/vendor"

export default function VendorDetailsPage() {
  const navigate = useNavigate()
  const params = useParams()
  const vendorId = Number(params.id)
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setVendor(await getVendorById(vendorId))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vendor.")
    }
  }

  useEffect(() => {
    if (Number.isFinite(vendorId)) {
      void load()
    }
  }, [vendorId])

  const handleSave = async () => {
    if (!vendor) {
      return
    }

    setError(null)

    try {
      setVendor(await updateVendor(vendor.id, {
        companyName: vendor.companyName,
        legalName: vendor.legalName,
        gstNumber: vendor.gstNumber,
        panNumber: vendor.panNumber,
        email: vendor.email,
        phone: vendor.phone,
        website: vendor.website,
        logoUrl: vendor.logoUrl,
        status: vendor.status,
        addresses: vendor.addresses.map((address) => ({
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          countryId: address.countryId ?? null,
          stateId: address.stateId ?? null,
          districtId: address.districtId ?? null,
          cityId: address.cityId ?? null,
          pincodeId: address.pincodeId ?? null,
        })),
        bankAccounts: vendor.bankAccounts.map((account) => ({
          bankId: account.bankId ?? null,
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          ifscCode: account.ifscCode,
          isPrimary: account.isPrimary,
        })),
      }))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update vendor.")
    }
  }

  if (!vendor) {
    return <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">{error ?? "Loading vendor..."}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Vendor Details</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/vendors/${vendor.id}/users`)}>Manage Users</Button>
          <Button onClick={() => void handleSave()}>Save</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {error ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{error}</div> : null}
        <Field label="Company Name">
          <Input value={vendor.companyName} onChange={(event) => setVendor((current) => current ? { ...current, companyName: event.target.value } : current)} />
        </Field>
        <Field label="Legal Name">
          <Input value={vendor.legalName} onChange={(event) => setVendor((current) => current ? { ...current, legalName: event.target.value } : current)} />
        </Field>
        <Field label="GST Number">
          <Input value={vendor.gstNumber} onChange={(event) => setVendor((current) => current ? { ...current, gstNumber: event.target.value } : current)} />
        </Field>
        <Field label="PAN Number">
          <Input value={vendor.panNumber} onChange={(event) => setVendor((current) => current ? { ...current, panNumber: event.target.value } : current)} />
        </Field>
        <Field label="Email">
          <Input value={vendor.email} onChange={(event) => setVendor((current) => current ? { ...current, email: event.target.value } : current)} />
        </Field>
        <Field label="Phone">
          <Input value={vendor.phone} onChange={(event) => setVendor((current) => current ? { ...current, phone: event.target.value } : current)} />
        </Field>
        <Field label="Website">
          <Input value={vendor.website} onChange={(event) => setVendor((current) => current ? { ...current, website: event.target.value } : current)} />
        </Field>
        <div className="grid gap-2 text-sm md:col-span-2">
          <MediaPicker value={vendor.logoUrl} onChange={(value) => setVendor((current) => current ? { ...current, logoUrl: value } : current)} module="vendors" preferredFolderId={2} imagesOnly label="Logo" />
        </div>
        <Field label="Status">
          <Input value={vendor.status} onChange={(event) => setVendor((current) => current ? { ...current, status: event.target.value } : current)} />
        </Field>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      {children}
    </label>
  )
}
