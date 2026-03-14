import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getProductById } from "@/api/productApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductDetail } from "@/types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getProductById(Number(params.id)).then(setProduct)
  }, [params.id])

  if (!product) {
    return <div className="text-sm text-muted-foreground">Loading product...</div>
  }

  const listPath = location.pathname.startsWith("/vendor") ? "/vendor/products" : "/admin/products"

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" render={<Link to={listPath}>Back</Link>} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={product.isPublished ? "bg-sky-500 text-white hover:bg-sky-500/90" : "bg-slate-500 text-white hover:bg-slate-500/90"}>
              {product.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge className={product.isActive ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-rose-500 text-white hover:bg-rose-500/90"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="SKU" value={product.sku} />
            <Info label="Slug" value={product.slug} />
            <Info label="Category" value={product.categoryName || "-"} />
            <Info label="Type" value={product.typeName || "-"} />
            <Info label="Group" value={product.groupName || "-"} />
            <Info label="Unit" value={product.unitName || "-"} />
            <Info label="Base Price" value={`${product.basePrice.toFixed(2)} ${product.currencyName || ""}`.trim()} />
            <Info label="Inventory" value={String(product.totalInventory)} />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Short Description</h3>
            <p className="text-sm text-muted-foreground">{product.shortDescription || "-"}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description || "-"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}
