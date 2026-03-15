import { Link } from "react-router-dom"

import type { ProductCategory } from "@/types/product"

export function CategoryGrid({ categories }: { categories: ProductCategory[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="rounded-[1.8rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(245,236,224,0.9))] p-5 shadow-[0_20px_45px_-34px_rgba(60,40,22,0.28)] transition hover:-translate-y-1"
        >
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</div>
          <div className="text-lg font-semibold">{category.name}</div>
          <div className="mt-2 text-sm text-muted-foreground">Explore curated picks in {category.name.toLowerCase()}.</div>
        </Link>
      ))}
    </div>
  )
}
