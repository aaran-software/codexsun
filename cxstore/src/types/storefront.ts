import type { ProductSummary } from "@/types/product"

export type ProductSortOption =
  | "featured"
  | "latest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "inventory-desc"

export interface CatalogFilters {
  minPrice: number
  maxPrice: number
  brand: string
  vendor: string
  availabilityOnly: boolean
  rating: number
}

export interface WishlistItem {
  productId: number
  slug: string
  name: string
  vendorName: string
  vendorCompanyName: string
  price: number
  imageUrl: string
  addedAt: string
}

export interface ProductReview {
  id: string
  productId: number
  userId?: string | null
  username: string
  rating: number
  title: string
  review: string
  createdAt: string
}

export interface CheckoutAddressDraft {
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface CheckoutStep {
  id: string
  label: string
}

export interface PaymentMethodOption {
  id: "stripe" | "razorpay" | "paypal" | "cod"
  label: string
  description: string
}

export interface ShippingMethodOption {
  id: string
  label: string
  description: string
  cost: number
  eta: string
}

export interface ProductCardModel {
  product: ProductSummary
  imageUrl: string
  price: number
  rating: number
  reviewCount: number
}
