import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { HeartIcon, ShoppingCartIcon } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { getStorefrontProductBySlug, getStorefrontProducts } from "@/api/productApi"
import { createProductReview, getProductReviews } from "@/api/reviewApi"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductGrid } from "@/components/product/ProductGrid"
import { QuantitySelector } from "@/components/product/QuantitySelector"
import { RatingStars } from "@/components/product/RatingStars"
import { ReviewForm } from "@/components/product/ReviewForm"
import { ReviewList } from "@/components/product/ReviewList"
import { Button } from "@/components/ui/button"
import { useCompanyConfig } from "@/config/company"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useCartStore } from "@/state/cartStore"
import { useAuth } from "@/state/authStore"
import { useWishlistStore } from "@/state/wishlistStore"
import { formatCurrency, getPrimaryProductImage, slugify } from "@/utils/storefront"

export default function ProductPage() {
  const { slug = "" } = useParams()
  const auth = useAuth()
  const { company } = useCompanyConfig()
  const queryClient = useQueryClient()
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist)
  const [quantity, setQuantity] = useState(1)
  const [reviewMessage, setReviewMessage] = useState("")

  const { data: product } = useQuery({
    queryKey: ["storefront", "product", slug],
    queryFn: () => getStorefrontProductBySlug(slug),
    enabled: Boolean(slug),
  })

  const { data: relatedCatalog = [] } = useQuery({
    queryKey: ["storefront", "products", "related", product?.categoryId],
    queryFn: () => getStorefrontProducts({ limit: 36 }),
  })
  const { data: reviews = [] } = useQuery({
    queryKey: ["storefront", "product", product?.id, "reviews"],
    queryFn: () => getProductReviews(product!.id),
    enabled: Boolean(product?.id),
  })
  const createReviewMutation = useMutation({
    mutationFn: createProductReview,
    onSuccess: async () => {
      setReviewMessage("Review submitted successfully.")
      await queryClient.invalidateQueries({ queryKey: ["storefront", "product", product?.id, "reviews"] })
      await queryClient.invalidateQueries({ queryKey: ["storefront", "product", slug] })
      await queryClient.invalidateQueries({ queryKey: ["storefront", "products"] })
    },
    onError: (caught) => {
      setReviewMessage(caught instanceof Error ? caught.message : "Unable to submit review.")
    },
  })

  const relatedProducts = useMemo(
    () => relatedCatalog
      .filter((candidate) => candidate.categoryId === product?.categoryId && candidate.id !== (product?.id ?? -1))
      .slice(0, 3),
    [product?.categoryId, product?.id, relatedCatalog],
  )
  const vendorSlug = product?.vendorCompanyName ? slugify(product.vendorCompanyName) : ""

  usePageMeta({
    title: product ? `${product.name} - Storefront` : "Product",
    description: product?.shortDescription || `Browse product details in the ${company.displayName} storefront.`,
    canonicalPath: `/product/${slug}`,
    structuredData: product ? {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription,
      sku: product.sku,
      image: product.images.map((image) => image.imageUrl),
      offers: {
        "@type": "Offer",
        priceCurrency: product.currencyName || "INR",
        price: product.basePrice,
        availability: product.totalInventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    } : undefined,
  })

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading product details...</div>
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.images} fallbackUrl={getPrimaryProductImage(product)} />
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-[0.26em] text-muted-foreground">{product.categoryName || "Catalog"}</div>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} size="md" />
            <div className="text-3xl font-semibold">{formatCurrency(product.basePrice, product.currencyName || "INR")}</div>
            <p className="text-sm text-muted-foreground">{product.shortDescription || product.description}</p>
          </div>

          <div className="grid gap-3 rounded-[1.8rem] border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vendor</span>
              <Link to={`/store/${vendorSlug}`} className="font-medium">{product.vendorCompanyName || product.vendorName || "Marketplace Vendor"}</Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SKU</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock</span>
              <span className="font-medium">{product.totalInventory > 0 ? `${product.totalInventory} available` : "Out of stock"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Brand</span>
              <span className="font-medium">{product.brandName || "Unbranded"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button className="rounded-full px-5" onClick={() => void addItem(product.id, quantity, product.variants[0]?.id ?? null, product.vendorUserId)}>
              <ShoppingCartIcon className="size-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="rounded-full px-5" onClick={() => void toggleWishlist(product.id)}>
              <HeartIcon className="size-4" />
              {isInWishlist(product.id) ? "Saved" : "Wishlist"}
            </Button>
          </div>

          <div className="rounded-[1.8rem] border border-border/60 bg-card p-5">
            <div className="text-lg font-semibold">Specifications</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.attributes.length > 0 ? product.attributes.map((attribute) => (
                <div key={attribute.id} className="rounded-2xl bg-muted/50 px-4 py-3">
                  <div className="text-sm font-medium">{attribute.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{attribute.values.map((value) => value.value).join(", ")}</div>
                </div>
              )) : <div className="text-sm text-muted-foreground">No attribute specifications were stored for this product yet.</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold">Description</h2>
        <div className="rounded-[1.8rem] border border-border/60 bg-card p-6 text-sm leading-7 text-muted-foreground">
          {product.description || "No long description was stored for this product."}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Reviews</h2>
          <ReviewList reviews={reviews} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Write a Review</h2>
          {reviewMessage ? <div className="rounded-[1.4rem] border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">{reviewMessage}</div> : null}
          {auth.isAuthenticated ? (
            <ReviewForm
              onSubmit={({ rating: reviewRating, title, review }) => {
                setReviewMessage("")
                createReviewMutation.mutate({
                  productId: product.id,
                  rating: reviewRating,
                  title,
                  review,
                })
              }}
            />
          ) : <div className="text-sm text-muted-foreground">Sign in with a customer account to submit a verified review.</div>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold">Related Products</h2>
        <ProductGrid products={relatedProducts} emptyMessage="No related products are available yet." />
      </section>
    </div>
  )
}
