import type { ProductSummary } from "@/types/product"
import { ProductCard } from "./ProductCard"

export function ProductGrid({ products, emptyMessage }: { products: ProductSummary[]; emptyMessage?: string }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-border/70 bg-card/70 p-10 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "No products found."}
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
