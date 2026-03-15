export interface ReturnItem {
  id: number
  orderItemId: number
  productId: number
  productName: string
  productSku: string
  quantity: number
  returnReason: string
  condition: string
  resolutionType: string
}

export interface ReturnSummary {
  id: number
  returnNumber: string
  orderId: number
  orderNumber: string
  customerContactId?: number | null
  customerName: string
  returnReason: string
  status: string
  requestedAt: string
  approvedAt?: string | null
  receivedAt?: string | null
  closedAt?: string | null
  createdAt: string
  itemCount: number
}

export interface ReturnDetail extends ReturnSummary {
  items: ReturnItem[]
}

export interface CreateReturnItemRequest {
  orderItemId: number
  productId: number
  quantity: number
  returnReason: string
  condition: string
  resolutionType: string
}

export interface CreateReturnRequest {
  orderId: number
  customerContactId?: number | null
  returnReason: string
  items: CreateReturnItemRequest[]
}

export interface ApproveReturnRequest {
  notes: string
}

export interface RefundSummary {
  id: number
  refundNumber: string
  orderId: number
  orderNumber: string
  returnId?: number | null
  returnNumber: string
  customerContactId?: number | null
  customerName: string
  currencyName: string
  refundAmount: number
  status: string
  refundMethod: string
  createdAt: string
  processedAt?: string | null
}

export interface ProcessRefundRequest {
  returnId: number
  warehouseId?: number | null
  paymentId?: number | null
  amount: number
  transactionReference: string
  status: string
}
