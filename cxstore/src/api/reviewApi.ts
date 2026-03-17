import { requestJson } from "@/api/httpClient"
import type { ProductReview } from "@/types/storefront"

export interface CreateReviewRequest {
  productId: number
  rating: number
  title: string
  review: string
}

export function getProductReviews(productId: number) {
  return requestJson<ProductReview[]>(`/storefront/products/${productId}/reviews`, { method: "GET" }, { auth: false })
}

export function getMyReviews() {
  return requestJson<ProductReview[]>("/reviews/my", { method: "GET" })
}

export function createProductReview(request: CreateReviewRequest) {
  return requestJson<ProductReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
