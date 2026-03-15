import { useEffect } from "react"

import { CouponInput } from "@/components/cart/CouponInput"
import { CartItemCard } from "@/components/cart/CartItemCard"
import { CartSummaryCard } from "@/components/cart/CartSummaryCard"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useCartStore } from "@/state/cartStore"

export default function CartPage() {
  const cart = useCartStore((state) => state.cart)
  const discountAmount = useCartStore((state) => state.discountAmount)
  const shippingCost = useCartStore((state) => state.shippingCost)
  const couponCode = useCartStore((state) => state.couponCode)
  const hydrateCart = useCartStore((state) => state.hydrateCart)
  const updateQty = useCartStore((state) => state.updateQty)
  const removeItem = useCartStore((state) => state.removeItem)
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const getTotal = useCartStore((state) => state.getTotal)

  usePageMeta({
    title: "Cart",
    description: "Review cart items, update quantities, and prepare for checkout.",
    canonicalPath: "/cart",
  })

  useEffect(() => {
    void hydrateCart()
  }, [hydrateCart])

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Cart</div>
          <h1 className="text-3xl font-semibold">Your basket</h1>
          <p className="text-sm text-muted-foreground">Cart persistence is backed by the existing anonymous/session cart API and mirrored locally for the storefront UI.</p>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={() => void removeItem(item.id)}
                onQuantityChange={(quantity) => void updateQty(item.id, quantity)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <CouponInput
          appliedCode={couponCode}
          onApply={async (code) => {
            const result = await applyCoupon(code)
            return result.message
          }}
        />
        <CartSummaryCard
          subtotal={cart?.subtotal ?? 0}
          discount={discountAmount}
          shipping={shippingCost}
          total={getTotal()}
          canCheckout={Boolean(cart && cart.items.length > 0)}
        />
      </div>
    </div>
  )
}
