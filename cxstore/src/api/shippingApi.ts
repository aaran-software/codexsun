import { requestJson } from "@/api/httpClient"
import type { Shipment, ShipmentCreateRequest, ShipmentStatusUpdateRequest, ShippingMethod } from "@/types/shipping"

export function getShipments() {
  return requestJson<Shipment[]>("/shipments", { method: "GET" })
}

export function getShippingMethods() {
  return requestJson<ShippingMethod[]>("/shipments/methods", { method: "GET" })
}

export function createShipment(request: ShipmentCreateRequest) {
  return requestJson<Shipment>("/shipments", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateShipmentStatus(id: number, request: ShipmentStatusUpdateRequest) {
  return requestJson<Shipment>(`/shipments/${id}/status`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function trackShipment(trackingNumber: string) {
  return requestJson<Shipment>(`/shipments/${trackingNumber}`, { method: "GET" })
}
