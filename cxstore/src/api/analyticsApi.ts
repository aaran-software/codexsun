import { requestJson } from "@/api/httpClient"
import type { ProductSalesSummary, SalesOverview, VendorSalesSummary } from "@/types/analytics"

export function getVendorSalesSummary(vendorId: number) {
  return requestJson<VendorSalesSummary>(`/analytics/vendors/${vendorId}/sales`, { method: "GET" })
}

export function getProductSalesSummary(productId: number) {
  return requestJson<ProductSalesSummary>(`/analytics/products/${productId}/sales`, { method: "GET" })
}

export function getSalesOverview() {
  return requestJson<SalesOverview>("/analytics/sales-overview", { method: "GET" })
}
