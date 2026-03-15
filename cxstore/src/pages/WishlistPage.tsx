import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useCartStore } from "@/state/cartStore"
import { useWishlistStore } from "@/state/wishlistStore"
import { formatCurrency } from "@/utils/storefront"

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const addItem = useCartStore((state) => state.addItem)

  usePageMeta({
    title: "Wishlist",
    description: "Saved customer wishlist items in the Codexsun storefront.",
    canonicalPath: "/wishlist",
  })

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Wishlist</div>
          <h1 className="text-3xl font-semibold">Saved products</h1>
          <p className="text-sm text-muted-foreground">Wishlist state is persisted locally today and is ready to move to a future backend wishlist API.</p>
        </div>
        {items.length > 0 ? <Button variant="outline" className="rounded-full" onClick={clearWishlist}>Clear Wishlist</Button> : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[1.8rem] border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.productId} className="rounded-[1.8rem] border-border/60">
              <CardContent className="space-y-4 p-5">
                <img src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full rounded-[1.3rem] object-cover" />
                <div className="space-y-1">
                  <Link to={`/product/${item.slug}`} className="text-lg font-semibold">{item.name}</Link>
                  <div className="text-sm text-muted-foreground">{item.vendorCompanyName || item.vendorName}</div>
                  <div className="text-base font-semibold">{formatCurrency(item.price)}</div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 rounded-full" onClick={() => void addItem(item.productId, 1)}>
                    Move to Cart
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={() => removeItem(item.productId)}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
