import { requestJson } from "@/api/httpClient"
import type {
  ApproveReturnRequest,
  CreateReturnRequest,
  ProcessRefundRequest,
  RefundSummary,
  ReturnDetail,
  ReturnSummary,
} from "@/types/returns"

export function getReturns() {
  return requestJson<ReturnSummary[]>("/returns", { method: "GET" })
}

export function getReturnById(id: number) {
  return requestJson<ReturnDetail>(`/returns/${id}`, { method: "GET" })
}

export function createReturn(request: CreateReturnRequest) {
  return requestJson<ReturnDetail>("/returns", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function approveReturn(id: number, request: ApproveReturnRequest) {
  return requestJson<ReturnDetail>(`/returns/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function getRefunds() {
  return requestJson<RefundSummary[]>("/refunds", { method: "GET" })
}

export function processRefund(request: ProcessRefundRequest) {
  return requestJson("/refunds/process", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
