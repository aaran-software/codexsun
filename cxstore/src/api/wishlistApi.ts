import { requestJson } from "@/api/httpClient"
import type { WishlistItem } from "@/types/storefront"

export function getWishlist() {
  return requestJson<WishlistItem[]>("/wishlist", { method: "GET" })
}

export function addWishlistItem(productId: number) {
  return requestJson<WishlistItem[]>("/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  })
}

export function removeWishlistItem(productId: number) {
  return requestJson<void>(`/wishlist/${productId}`, { method: "DELETE" })
}

export function clearWishlist() {
  return requestJson<void>("/wishlist", { method: "DELETE" })
}
