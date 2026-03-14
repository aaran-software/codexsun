import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getProductById, updateProduct } from "@/api/productApi"
import { ProductForm } from "@/components/admin/products/ProductForm"
import type { ProductDetail } from "@/types/product"

export default function ProductEditPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getProductById(Number(params.id)).then(setProduct)
  }, [params.id])

  const listPath = location.pathname.startsWith("/vendor") ? "/vendor/products" : "/admin/products"

  return (
    <ProductForm
      title="Edit Product"
      description="Update catalog pricing, vendor links, variants, and inventory settings."
      submitLabel="Save Product"
      initialValue={product}
      onSubmit={async (request) => {
        await updateProduct(Number(params.id), request)
        navigate(listPath, { replace: true })
      }}
    />
  )
}
