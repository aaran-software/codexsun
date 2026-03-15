export interface PromotionProduct {
  productId: number
  productName: string
}

export interface Promotion {
  id: number
  name: string
  description: string
  discountType: string
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
  products: PromotionProduct[]
}

export interface PromotionUpsertRequest {
  name: string
  description: string
  discountType: string
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
  productIds: number[]
}

export interface Coupon {
  id: number
  code: string
  discountType: string
  discountValue: number
  usageLimit: number
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
}

export interface CouponUpsertRequest {
  code: string
  discountType: string
  discountValue: number
  usageLimit: number
  startDate: string
  endDate: string
  isActive: boolean
}

export interface CouponValidationRequest {
  code: string
  orderId?: number | null
  amount: number
}

export interface CouponApplyRequest {
  code: string
  orderId: number
}

export interface CouponValidationResponse {
  isValid: boolean
  message: string
  code: string
  discountAmount: number
  finalAmount: number
}
