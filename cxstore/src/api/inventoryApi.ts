import { requestJson } from "@/api/httpClient"
import type {
  InventoryAdjustmentRequest,
  InventorySummary,
  PurchaseOrder,
  PurchaseOrderCreateRequest,
  PurchaseOrderReceiveRequest,
  StockMovement,
  Transfer,
  TransferCreateRequest,
} from "@/types/inventory"

export function getPurchaseOrders() {
  return requestJson<PurchaseOrder[]>("/inventory/purchase-orders", { method: "GET" })
}

export function getPurchaseOrderById(id: number) {
  return requestJson<PurchaseOrder>(`/inventory/purchase-orders/${id}`, { method: "GET" })
}

export function createPurchaseOrder(request: PurchaseOrderCreateRequest) {
  return requestJson<PurchaseOrder>("/inventory/purchase-orders", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function receivePurchaseOrder(id: number, request: PurchaseOrderReceiveRequest) {
  return requestJson<PurchaseOrder>(`/inventory/purchase-orders/${id}/receive`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function getTransfers() {
  return requestJson<Transfer[]>("/inventory/transfers", { method: "GET" })
}

export function createTransfer(request: TransferCreateRequest) {
  return requestJson<Transfer>("/inventory/transfers", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function completeTransfer(id: number) {
  return requestJson<Transfer>(`/inventory/transfers/${id}/complete`, {
    method: "POST",
  })
}

export function getProductInventory(productId: number) {
  return requestJson<InventorySummary[]>(`/inventory/products/${productId}`, { method: "GET" })
}

export function getWarehouseInventory(warehouseId: number) {
  return requestJson<InventorySummary[]>(`/inventory/warehouse/${warehouseId}`, { method: "GET" })
}

export function adjustInventory(request: InventoryAdjustmentRequest) {
  return requestJson<InventoryAdjustmentRequest>("/inventory/adjustments", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function getStockMovements() {
  return requestJson<StockMovement[]>("/inventory/movements", { method: "GET" })
}
