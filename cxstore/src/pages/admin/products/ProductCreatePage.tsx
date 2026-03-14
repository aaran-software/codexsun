import { useNavigate } from "react-router-dom"

import { createProduct } from "@/api/productApi"
import { ProductForm } from "@/components/admin/products/ProductForm"

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const listPath = isVendorRoute ? "/vendor/products" : "/admin/products"

  return (
    <ProductForm
      title="Create Product"
      description="Create products for ecommerce, wholesale, billing, and vendor listings."
      submitLabel="Create Product"
      onSubmit={async (request) => {
        await createProduct(request)
        navigate(listPath, { replace: true })
      }}
    />
  )
}
