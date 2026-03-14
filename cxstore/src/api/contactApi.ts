import { requestJson } from "@/api/httpClient"
import type { ContactDetail, ContactGroup, ContactSummary, ContactUpsertRequest } from "@/types/contact"

export function getContacts(includeInactive = false) {
  return requestJson<ContactSummary[]>(`/contacts?includeInactive=${includeInactive}`, { method: "GET" })
}

export function getContactById(id: number) {
  return requestJson<ContactDetail>(`/contacts/${id}`, { method: "GET" })
}

export function createContact(request: ContactUpsertRequest) {
  return requestJson<ContactDetail>("/contacts", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateContact(id: number, request: ContactUpsertRequest) {
  return requestJson<ContactDetail>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function deleteContact(id: number) {
  return requestJson<void>(`/contacts/${id}`, { method: "DELETE" })
}

export function getContactGroups() {
  return requestJson<ContactGroup[]>("/contacts/groups", { method: "GET" })
}
