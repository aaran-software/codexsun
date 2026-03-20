import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { createCustomerAddress, getCustomerAddresses, updateCustomerAddress, type CustomerAddressUpsertRequest } from "@/api/customerAddressApi"
import { applyCoupon } from "@/api/promotionApi"
import { createOrder } from "@/api/salesApi"
import { getShippingMethods } from "@/api/shippingApi"
import { AddressFormCard } from "@/components/checkout/AddressFormCard"
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper"
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard"
import { PaymentSelector } from "@/components/checkout/PaymentSelector"
import { ShippingOptions } from "@/components/checkout/ShippingOptions"
import { StorefrontAuthNotice } from "@/components/layout/storefront-auth-notice"
import { Button } from "@/components/ui/button"
import { useCompanyConfig } from "@/config/company"
import { usePageMeta } from "@/hooks/usePageMeta"
import { launchRazorpayOrderPayment } from "@/lib/razorpay"
import { useCartStore } from "@/state/cartStore"
import { useAuth } from "@/state/authStore"
import type { CheckoutAddressDraft, PaymentMethodOption, ShippingMethodOption } from "@/types/storefront"

const steps = [
  { id: "address", label: "Address" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
]

const paymentOptions: PaymentMethodOption[] = [
  { id: "razorpay", label: "Razorpay", description: "Cards, UPI, netbanking, and wallets through one hosted checkout." },
  { id: "cod", label: "Cash on Delivery", description: "Collect payment at delivery." },
]

const blankAddress: CheckoutAddressDraft = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
}

function createCheckoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `checkout-${crypto.randomUUID()}`
  }

  return `checkout-${Date.now()}`
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { company } = useCompanyConfig()
  const cart = useCartStore((state) => state.cart)
  const sessionId = useCartStore((state) => state.sessionId)
  const discountAmount = useCartStore((state) => state.discountAmount)
  const couponCode = useCartStore((state) => state.couponCode)
  const shippingCost = useCartStore((state) => state.shippingCost)
  const shippingMethod = useCartStore((state) => state.shippingMethod)
  const paymentMethod = useCartStore((state) => state.paymentMethod)
  const hydrateCart = useCartStore((state) => state.hydrateCart)
  const setShippingMethod = useCartStore((state) => state.setShippingMethod)
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotal = useCartStore((state) => state.getTotal)
  const [currentStep, setCurrentStep] = useState("address")
  const [billingAddress, setBillingAddress] = useState<CheckoutAddressDraft>({ ...blankAddress, email: auth.user?.email ?? "", fullName: auth.user?.username ?? "" })
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddressDraft>({ ...blankAddress, email: auth.user?.email ?? "", fullName: auth.user?.username ?? "" })
  const [idempotencyKey, setIdempotencyKey] = useState(createCheckoutIdempotencyKey)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  usePageMeta({
    title: "Checkout",
    description: `Complete your ${company.displayName} storefront order.`,
    canonicalPath: "/checkout",
  })

  const { data: shippingMethods = [] } = useQuery({
    queryKey: ["storefront", "shipping-methods"],
    queryFn: getShippingMethods,
    enabled: auth.isAuthenticated,
  })
  const { data: customerAddresses = [] } = useQuery({
    queryKey: ["storefront", "customer-addresses"],
    queryFn: getCustomerAddresses,
    enabled: auth.isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    void hydrateCart()
  }, [hydrateCart])

  useEffect(() => {
    const defaultAddress = customerAddresses.find((address) => address.isDefault) ?? customerAddresses[0]
    if (!defaultAddress) {
      return
    }

    setBillingAddress((current) => current.addressLine1
      ? current
      : {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          email: defaultAddress.email,
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          country: defaultAddress.country,
          postalCode: defaultAddress.postalCode,
        })

    setShippingAddress((current) => current.addressLine1
      ? current
      : {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          email: defaultAddress.email,
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          country: defaultAddress.country,
          postalCode: defaultAddress.postalCode,
        })
  }, [customerAddresses])

  useEffect(() => {
    if (paymentMethod !== "razorpay" && paymentMethod !== "cod") {
      setPaymentMethod("razorpay")
    }
  }, [paymentMethod, setPaymentMethod])

  const shippingOptions: ShippingMethodOption[] = useMemo(() => (
    shippingMethods.length > 0
      ? shippingMethods.map((method) => ({
          id: String(method.id),
          label: method.name,
          description: `${method.providerName} - ${method.estimatedDays} day delivery window`,
          cost: method.baseCost,
          eta: `${method.estimatedDays} days`,
        }))
      : [
          { id: "standard", label: "Standard Delivery", description: "Default storefront shipping option", cost: 0, eta: "3-5 days" },
          { id: "express", label: "Express Delivery", description: "Faster delivery placeholder", cost: 199, eta: "1-2 days" },
        ]
  ), [shippingMethods])

  const persistCheckoutAddress = async () => {
    const defaultAddress = customerAddresses.find((address) => address.isDefault) ?? customerAddresses[0]
    const request: CustomerAddressUpsertRequest = {
      label: defaultAddress?.label || "Primary",
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      country: shippingAddress.country,
      postalCode: shippingAddress.postalCode,
      isDefault: true,
    }

    if (defaultAddress) {
      await updateCustomerAddress(defaultAddress.id, request)
      return
    }

    await createCustomerAddress(request)
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <StorefrontAuthNotice title="Checkout requires sign-in" description="The backend order API is authenticated. Sign in before converting your cart into an order." />
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const order = await createOrder({
        sessionId,
        idempotencyKey,
        customerContactId: undefined,
        currencyId: cart.currencyId ?? undefined,
        discountAmount,
        shippingMethod,
        paymentMethod,
        billingAddress: {
          contactId: undefined,
          addressType: "Billing",
          addressLine1: billingAddress.addressLine1,
          addressLine2: billingAddress.addressLine2,
          city: billingAddress.city,
          state: billingAddress.state,
          country: billingAddress.country,
          postalCode: billingAddress.postalCode,
        },
        shippingAddress: {
          contactId: undefined,
          addressType: "Shipping",
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
        },
      })

      if (couponCode) {
        await applyCoupon({ code: couponCode, orderId: order.id })
      }

      try {
        await persistCheckoutAddress()
      } catch {
        // Address-book persistence should not invalidate a successfully created order.
      }

      await clearCart()

      if (paymentMethod === "cod") {
        setIdempotencyKey(createCheckoutIdempotencyKey())
        navigate(`/order-success/${order.id}?payment=${encodeURIComponent(paymentMethod)}`)
        return
      }

      await launchRazorpayOrderPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: billingAddress.fullName || auth.user?.username,
        customerEmail: billingAddress.email || auth.user?.email,
        customerPhone: billingAddress.phone || shippingAddress.phone,
        navigate,
      })
      setIdempotencyKey(createCheckoutIdempotencyKey())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create order.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="space-y-1">
        <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Checkout</div>
        <h1 className="text-3xl font-semibold">Complete your order</h1>
        <p className="text-sm text-muted-foreground">Checkout now submits an idempotent order request, initializes a hosted Razorpay session for online payments, and verifies payment on the backend before marking the order paid.</p>
      </div>

      <CheckoutStepper steps={steps} currentStep={currentStep} />

      {error ? <div className="rounded-[1.4rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AddressFormCard title="Billing Address" value={billingAddress} onChange={setBillingAddress} />
          <AddressFormCard title="Shipping Address" value={shippingAddress} onChange={setShippingAddress} />

          <div className="rounded-[1.8rem] border border-border/60 bg-card p-5">
            <div className="mb-4 text-lg font-semibold">Shipping Options</div>
            <ShippingOptions
              options={shippingOptions}
              value={String(shippingMethod)}
              onChange={(option) => {
                setShippingMethod(option.id, option.cost)
                setCurrentStep("shipping")
              }}
            />
          </div>

          <div className="rounded-[1.8rem] border border-border/60 bg-card p-5">
            <div className="mb-4 text-lg font-semibold">Payment Method</div>
            <PaymentSelector
              options={paymentOptions}
              value={paymentMethod}
              onChange={(option) => {
                setPaymentMethod(option.id)
                setCurrentStep("payment")
              }}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Razorpay is the live online payment path here and includes UPI inside the same hosted checkout. Cash on Delivery remains available without an external provider.
            </p>
          </div>

          <div className="flex justify-end">
            <Button className="rounded-full px-6" onClick={() => void handleSubmit()} disabled={isSubmitting || !cart || cart.items.length === 0}>
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>

        <OrderSummaryCard subtotal={cart?.subtotal ?? 0} discount={discountAmount} shipping={shippingCost} total={getTotal()} />
      </div>
    </div>
  )
}
