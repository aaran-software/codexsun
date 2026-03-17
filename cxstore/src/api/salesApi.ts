import { requestJson } from "@/api/httpClient"
import type {
  Cart,
  CreateOrderRequest,
  InvoiceDetail,
  InvoiceSummary,
  InitializeRazorpayCheckoutRequest,
  OrderDetail,
  OrderSummary,
  PaymentSummary,
  RecordPaymentRequest,
  RazorpayCheckoutSession,
  RazorpayPaymentVerification,
  VerifyRazorpayPaymentRequest,
  VendorPayoutSummary,
} from "@/types/sales"

const CART_SESSION_KEY = "cxstore_cart_session_id"

export function getCartSessionId() {
  if (typeof window === "undefined") {
    return ""
  }

  const existing = window.localStorage.getItem(CART_SESSION_KEY)
  if (existing) {
    return existing
  }

  const created = `guest-${crypto.randomUUID()}`
  window.localStorage.setItem(CART_SESSION_KEY, created)
  return created
}

export function getCart(sessionId = getCartSessionId()) {
  return requestJson<Cart>(`/cart?sessionId=${encodeURIComponent(sessionId)}`, { method: "GET" })
}

export function addCartItem(productId: number, quantity = 1, productVariantId?: number | null, vendorUserId?: string | null) {
  return requestJson<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      sessionId: getCartSessionId(),
      productId,
      productVariantId,
      quantity,
      vendorUserId,
    }),
  })
}

export function updateCartItem(id: number, quantity: number) {
  return requestJson<Cart>(`/cart/items/${id}`, {
    method: "PUT",
    headers: {
      "X-Cart-Session-Id": getCartSessionId(),
    },
    body: JSON.stringify({ quantity }),
  })
}

export function removeCartItem(id: number) {
  return requestJson<void>(`/cart/items/${id}`, {
    method: "DELETE",
    headers: {
      "X-Cart-Session-Id": getCartSessionId(),
    },
  })
}

export function clearCart(sessionId = getCartSessionId()) {
  return requestJson<void>(`/cart?sessionId=${encodeURIComponent(sessionId)}`, { method: "DELETE" })
}

export function getOrders() {
  return requestJson<OrderSummary[]>("/orders", { method: "GET" })
}

export function getOrderById(id: number) {
  return requestJson<OrderDetail>(`/orders/${id}`, { method: "GET" })
}

export function createOrder(request: CreateOrderRequest) {
  return requestJson<OrderDetail>("/orders", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateOrderStatus(id: number, status: string, notes = "") {
  return requestJson<OrderDetail>(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, notes }),
  })
}

export function getInvoices() {
  return requestJson<InvoiceSummary[]>("/invoices", { method: "GET" })
}

export function getInvoiceById(id: number) {
  return requestJson<InvoiceDetail>(`/invoices/${id}`, { method: "GET" })
}

export function createInvoice(orderId: number, dueDate?: string | null) {
  return requestJson<InvoiceDetail>("/invoices", {
    method: "POST",
    body: JSON.stringify({ orderId, dueDate }),
  })
}

export function getPayments() {
  return requestJson<PaymentSummary[]>("/payments", { method: "GET" })
}

export function recordPayment(request: RecordPaymentRequest) {
  return requestJson<PaymentSummary>("/payments", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function initializeRazorpayCheckout(request: InitializeRazorpayCheckoutRequest) {
  return requestJson<RazorpayCheckoutSession>("/payments/razorpay/checkout", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function verifyRazorpayPayment(request: VerifyRazorpayPaymentRequest) {
  return requestJson<RazorpayPaymentVerification>("/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function reconcileRazorpayPayment(orderId: number) {
  return requestJson<RazorpayPaymentVerification>(`/payments/razorpay/reconcile/${orderId}`, {
    method: "POST",
  })
}

export function getVendorPayouts() {
  return requestJson<VendorPayoutSummary[]>("/vendor-payouts", { method: "GET" })
}

export function createVendorPayout(vendorUserId?: string) {
  return requestJson<VendorPayoutSummary>("/vendor-payouts", {
    method: "POST",
    body: JSON.stringify({ vendorUserId }),
  })
}

export function approveVendorPayout(id: number, markAsPaid = false) {
  return requestJson<VendorPayoutSummary>(`/vendor-payouts/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ markAsPaid }),
  })
}
