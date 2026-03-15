export interface ShippingMethod {
  id: number
  name: string
  providerName: string
  baseCost: number
  costPerKg: number
  estimatedDays: number
}

export interface ShipmentItem {
  id: number
  orderItemId: number
  productId: number
  productName: string
  quantity: number
}

export interface Shipment {
  id: number
  orderId: number
  orderNumber: string
  shippingMethodId: number
  shippingMethodName: string
  providerName: string
  trackingNumber: string
  status: string
  shippedAt?: string | null
  deliveredAt?: string | null
  items: ShipmentItem[]
}

export interface ShipmentItemCreateRequest {
  orderItemId: number
  quantity: number
}

export interface ShipmentCreateRequest {
  orderId: number
  shippingMethodId: number
  trackingNumber: string
  items: ShipmentItemCreateRequest[]
}

export interface ShipmentStatusUpdateRequest {
  status: string
}
