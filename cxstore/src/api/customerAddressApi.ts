import { requestJson } from "@/api/httpClient"
import type { CheckoutAddressDraft, CustomerAddress } from "@/types/storefront"

export interface CustomerAddressUpsertRequest extends CheckoutAddressDraft {
  label: string
  isDefault: boolean
}

export function getCustomerAddresses() {
  return requestJson<CustomerAddress[]>("/storefront/addresses", { method: "GET" })
}

export function createCustomerAddress(request: CustomerAddressUpsertRequest) {
  return requestJson<CustomerAddress>("/storefront/addresses", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateCustomerAddress(addressId: number, request: CustomerAddressUpsertRequest) {
  return requestJson<CustomerAddress>(`/storefront/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function deleteCustomerAddress(addressId: number) {
  return requestJson<void>(`/storefront/addresses/${addressId}`, { method: "DELETE" })
}
