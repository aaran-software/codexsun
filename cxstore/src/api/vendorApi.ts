import { requestJson } from "@/api/httpClient"
import type { CommonMasterItem } from "@/types/common"
import type { AssignVendorUserRequest, VendorDetail, VendorSummary, VendorUpsertRequest, VendorUserSummary } from "@/types/vendor"

export function getVendors() {
  return requestJson<VendorSummary[]>("/vendors", { method: "GET" })
}

export function getVendorById(id: number) {
  return requestJson<VendorDetail>(`/vendors/${id}`, { method: "GET" })
}

export function createVendor(request: VendorUpsertRequest) {
  return requestJson<VendorDetail>("/vendors", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateVendor(id: number, request: VendorUpsertRequest) {
  return requestJson<VendorDetail>(`/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function getVendorUsers(vendorId: number) {
  return requestJson<VendorUserSummary[]>(`/vendors/${vendorId}/users`, { method: "GET" })
}

export function assignVendorUser(vendorId: number, request: AssignVendorUserRequest) {
  return requestJson<VendorUserSummary>(`/vendors/${vendorId}/users`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function getAccessibleWarehouses() {
  return requestJson<CommonMasterItem[]>("/vendors/warehouses", { method: "GET" })
}

export function getStorefrontVendors(limit?: number) {
  const url = limit ? `/storefront/vendors?limit=${limit}` : "/storefront/vendors"
  return requestJson<VendorSummary[]>(url, { method: "GET" }, { auth: false })
}
