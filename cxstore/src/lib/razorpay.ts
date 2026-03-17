import type { NavigateFunction } from "react-router-dom"

import { initializeRazorpayCheckout, verifyRazorpayPayment } from "@/api/salesApi"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

let razorpayScriptPromise: Promise<void> | null = null

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."))
  }

  if (window.Razorpay) {
    return Promise.resolve()
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."))
      document.body.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

export function canRetryRazorpayPayment(createdAt: string, paymentMethod: string, paymentStatus: string, orderStatus: string, expiryMinutes = 30) {
  if (paymentMethod !== "razorpay") {
    return false
  }

  if (paymentStatus === "Completed" || paymentStatus === "Expired") {
    return false
  }

  if (orderStatus === "Cancelled" || orderStatus === "Canceled" || orderStatus === "Expired") {
    return false
  }

  const createdAtTime = new Date(createdAt).getTime()
  if (Number.isNaN(createdAtTime)) {
    return false
  }

  return Date.now() - createdAtTime < expiryMinutes * 60 * 1000
}

export async function launchRazorpayOrderPayment(options: {
  orderId: number
  orderNumber: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  navigate: NavigateFunction
}) {
  const session = await initializeRazorpayCheckout({ orderId: options.orderId })
  await loadRazorpayScript()

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is not available in this browser.")
  }

  const RazorpayCheckout = window.Razorpay

  await new Promise<void>((resolve, reject) => {
    const checkout = new RazorpayCheckout({
      key: session.keyId,
      amount: session.amountInSubunits,
      currency: session.currency,
      name: session.merchantName,
      description: session.description,
      order_id: session.razorpayOrderId,
      prefill: {
        name: options.customerName || session.customerName,
        email: options.customerEmail || session.customerEmail,
        contact: options.customerPhone || session.customerPhone,
      },
      notes: {
        orderNumber: session.orderNumber,
        codexsunOrderId: String(session.orderId),
      },
      theme: {
        color: session.themeColor,
      },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await verifyRazorpayPayment({
            orderId: options.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          options.navigate(`/order-success/${options.orderId}?payment=razorpay&status=paid`)
          resolve()
        } catch (verificationError) {
          reject(verificationError)
        }
      },
      modal: {
        ondismiss: () => {
          options.navigate(`/order-success/${options.orderId}?payment=razorpay&status=pending`)
          resolve()
        },
      },
    })

    checkout.open()
  })
}
