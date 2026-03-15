import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getVendorById, updateVendor } from "@/api/vendorApi"
import { VendorForm } from "@/components/admin/vendors/VendorForm"
import { Button } from "@/components/ui/button"
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

  if (!vendor) {
    return <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">{error ?? "Loading vendor..."}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate(`/admin/vendors/${vendor.id}/users`)}>Manage Users</Button>
      </div>
      <VendorForm
        title="Vendor Details"
        description="Update the vendor company profile using the same structured section layout as contact management."
        submitLabel="Save Vendor"
        initialValue={vendor}
        onSubmit={async (request) => {
          setError(null)
          try {
            await updateVendor(vendor.id, request)
            navigate("/admin/vendors")
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to update vendor.")
            throw submitError
          }
        }}
      />
      {error ? <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
    </div>
  )
}
