import { HeartIcon, ShoppingCartIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCartStore } from "@/state/cartStore"
import { useWishlistStore } from "@/state/wishlistStore"
import type { ProductSummary } from "@/types/product"
import { formatCurrency, getAverageRating, getPrimaryProductImage, getReviewCount, slugify, toWishlistItem } from "@/utils/storefront"
import { RatingStars } from "./RatingStars"

export function ProductCard({ product }: { product: ProductSummary }) {
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))
  const imageUrl = getPrimaryProductImage(product)
  const rating = getAverageRating(product.id)
  const reviewCount = getReviewCount(product.id)
  const vendorSlug = product.vendorCompanyName ? slugify(product.vendorCompanyName) : (product.vendorId ?? product.vendorUserId ?? "vendor").toString()

  return (
    <Card className="overflow-hidden rounded-[1.6rem] border-border/60 bg-card/95 shadow-[0_24px_60px_-34px_rgba(40,28,18,0.28)] transition hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#efe6db,#f9f5ef)]">
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
      </Link>
      <CardContent className="space-y-3 p-5">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{product.categoryName || "Catalog"}</div>
          <Link to={`/product/${product.slug}`} className="line-clamp-2 text-lg font-semibold text-foreground">{product.name}</Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link to={`/store/${vendorSlug}`}>{product.vendorCompanyName || product.vendorName || "Marketplace Vendor"}</Link>
        </div>
        <RatingStars rating={rating} reviewCount={reviewCount} />
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{formatCurrency(product.basePrice, product.currencyName || "INR")}</div>
          <div className="text-xs text-muted-foreground">{product.totalInventory > 0 ? `${product.totalInventory} in stock` : "Out of stock"}</div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-[1fr_auto] gap-3 p-5 pt-0">
        <Button className="rounded-full" onClick={() => void addItem(product.id, 1, null, product.vendorUserId)}>
          <ShoppingCartIcon className="size-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => toggleWishlist(toWishlistItem(product, imageUrl))}>
          <HeartIcon className={isInWishlist ? "size-4 fill-current" : "size-4"} />
        </Button>
      </CardFooter>
    </Card>
  )
}
