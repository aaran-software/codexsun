import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getCart, removeCartItem } from "@/api/salesApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Cart } from "@/types/sales"

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCart = async () => {
    setLoading(true)
    setError(null)

    try {
      setCart(await getCart())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load cart.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6 text-sm text-muted-foreground">Loading cart...</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-sm text-muted-foreground">Review your selected products before checkout.</p>
      </div>

      {error ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Cart Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!cart || cart.items.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Your cart is empty.</div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">{item.productSku}{item.productVariantName ? ` • ${item.productVariantName}` : ""}</div>
                  {item.vendorName ? <div className="text-xs text-muted-foreground">Vendor: {item.vendorName}</div> : null}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>Qty: {item.quantity}</span>
                  <span>{item.totalPrice.toFixed(2)}</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => void removeCartItem(item.id).then(loadCart)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Items: <span className="font-medium text-foreground">{cart?.totalItems ?? 0}</span> • Subtotal:{" "}
            <span className="font-medium text-foreground">{(cart?.subtotal ?? 0).toFixed(2)}</span>
          </div>
          <Button type="button" render={<Link to="/checkout" />} disabled={!cart || cart.items.length === 0}>
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
