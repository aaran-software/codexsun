import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getContactById, updateContact } from "@/api/contactApi"
import { ContactForm } from "@/components/admin/contacts/ContactForm"
import type { ContactDetail } from "@/types/contact"

export default function ContactEditPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [contact, setContact] = useState<ContactDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getContactById(Number(params.id)).then(setContact)
  }, [params.id])

  const listPath = location.pathname.startsWith("/vendor") ? "/vendor/contacts" : "/admin/contacts"

  return (
    <ContactForm
      title="Edit Contact"
      description="Update shared contact information, addresses, and communication channels."
      submitLabel="Save Contact"
      initialValue={contact}
      onSubmit={async (request) => {
        await updateContact(Number(params.id), request)
        navigate(listPath, { replace: true })
      }}
    />
  )
}
