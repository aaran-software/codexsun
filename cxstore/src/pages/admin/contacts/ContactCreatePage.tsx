import { useNavigate } from "react-router-dom"

import { createContact } from "@/api/contactApi"
import { ContactForm } from "@/components/admin/contacts/ContactForm"

export default function ContactCreatePage() {
  const navigate = useNavigate()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const listPath = isVendorRoute ? "/vendor/contacts" : "/admin/contacts"

  return (
    <ContactForm
      title="Create Contact"
      description="Create customers, suppliers, billing contacts, or vendor contacts."
      submitLabel="Create Contact"
      onSubmit={async (request) => {
        await createContact(request)
        navigate(listPath, { replace: true })
      }}
    />
  )
}
