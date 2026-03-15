import { requestJson } from "@/api/httpClient"
import type {
  Coupon,
  CouponApplyRequest,
  CouponUpsertRequest,
  CouponValidationRequest,
  CouponValidationResponse,
  Promotion,
  PromotionUpsertRequest,
} from "@/types/promotion"

export function getPromotions() {
  return requestJson<Promotion[]>("/promotions", { method: "GET" })
}

export function createPromotion(request: PromotionUpsertRequest) {
  return requestJson<Promotion>("/promotions", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function getCoupons() {
  return requestJson<Coupon[]>("/coupons", { method: "GET" })
}

export function createCoupon(request: CouponUpsertRequest) {
  return requestJson<Coupon>("/coupons", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function validateCoupon(request: CouponValidationRequest) {
  return requestJson<CouponValidationResponse>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function applyCoupon(request: CouponApplyRequest) {
  return requestJson<CouponValidationResponse>("/coupons/apply", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
