import { useNavigate } from "react-router-dom"

import { createVendor } from "@/api/vendorApi"
import { VendorForm } from "@/components/admin/vendors/VendorForm"

export default function VendorCreatePage() {
  const navigate = useNavigate()

  return (
    <VendorForm
      title="Create Vendor"
      description="Capture the vendor company profile using the same structured form tone as contact management."
      submitLabel="Create Vendor"
      onSubmit={async (request) => {
        const created = await createVendor(request)
        navigate(`/admin/vendors/${created.id}`)
      }}
    />
  )
}
