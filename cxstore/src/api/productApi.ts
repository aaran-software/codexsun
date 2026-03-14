import { requestJson } from "@/api/httpClient"
import type { ProductCategory, ProductDetail, ProductSummary, ProductUpsertRequest } from "@/types/product"

export function getProducts(includeInactive = false) {
  return requestJson<ProductSummary[]>(`/products?includeInactive=${includeInactive}`, { method: "GET" })
}

export function getProductById(id: number) {
  return requestJson<ProductDetail>(`/products/${id}`, { method: "GET" })
}

export function getProductsByVendor(vendorId: string, includeInactive = false) {
  return requestJson<ProductSummary[]>(`/products/vendor/${vendorId}?includeInactive=${includeInactive}`, { method: "GET" })
}

export function getProductsByCategory(categoryId: number, includeInactive = false) {
  return requestJson<ProductSummary[]>(`/products/category/${categoryId}?includeInactive=${includeInactive}`, { method: "GET" })
}

export function createProduct(request: ProductUpsertRequest) {
  return requestJson<ProductDetail>("/products", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateProduct(id: number, request: ProductUpsertRequest) {
  return requestJson<ProductDetail>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function deleteProduct(id: number) {
  return requestJson<void>(`/products/${id}`, { method: "DELETE" })
}

export function getProductCategories(includeInactive = false) {
  return requestJson<ProductCategory[]>(`/products/categories?includeInactive=${includeInactive}`, { method: "GET" })
}

export function createProductCategory(name: string) {
  return requestJson<ProductCategory>("/products/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}
