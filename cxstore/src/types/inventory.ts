export interface PurchaseOrderItem {
  id: number
  productId: number
  productName: string
  productVariantId?: number | null
  productVariantName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  vendorUserId: string
  vendorId?: number | null
  vendorCompanyName: string
  vendorName: string
  currencyId?: number | null
  currencyName: string
  status: string
  totalAmount: number
  expectedDate?: string | null
  createdAt: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderCreateItemRequest {
  productId: number
  productVariantId?: number | null
  quantity: number
  unitPrice: number
}

export interface PurchaseOrderCreateRequest {
  vendorUserId: string
  currencyId?: number | null
  expectedDate?: string | null
  items: PurchaseOrderCreateItemRequest[]
}

export interface PurchaseOrderReceiveRequest {
  warehouseId: number
}

export interface TransferItem {
  id: number
  productId: number
  productName: string
  productVariantId?: number | null
  productVariantName: string
  quantity: number
}

export interface Transfer {
  id: number
  transferNumber: string
  fromWarehouseId: number
  fromWarehouseName: string
  toWarehouseId: number
  toWarehouseName: string
  status: string
  createdAt: string
  items: TransferItem[]
}

export interface TransferCreateItemRequest {
  productId: number
  productVariantId?: number | null
  quantity: number
}

export interface TransferCreateRequest {
  fromWarehouseId: number
  toWarehouseId: number
  items: TransferCreateItemRequest[]
}

export interface InventorySummary {
  productId: number
  productName: string
  productSku: string
  productVariantId?: number | null
  productVariantName: string
  warehouseId: number
  warehouseName: string
  quantityOnHand: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
}

export interface InventoryAdjustmentItemRequest {
  productId: number
  productVariantId?: number | null
  newQuantity: number
}

export interface InventoryAdjustmentRequest {
  warehouseId: number
  reason: string
  items: InventoryAdjustmentItemRequest[]
}

export interface StockMovement {
  id: number
  productId: number
  productName: string
  productVariantId?: number | null
  productVariantName: string
  warehouseId: number
  warehouseName: string
  movementType: string
  quantity: number
  referenceType: string
  referenceId: number
  createdAt: string
  createdByUsername: string
}
