import { useEffect, useState } from "react"

import { getSalesOverview, getVendorSalesSummary, getProductSalesSummary } from "@/api/analyticsApi"
import { getProducts } from "@/api/productApi"
import { getVendors } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProductSalesSummary, SalesOverview, VendorSalesSummary } from "@/types/analytics"
import type { ProductSummary } from "@/types/product"
import type { VendorSummary } from "@/types/vendor"

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<SalesOverview | null>(null)
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [vendorId, setVendorId] = useState("")
  const [productId, setProductId] = useState("")
  const [vendorSummary, setVendorSummary] = useState<VendorSalesSummary | null>(null)
  const [productSummary, setProductSummary] = useState<ProductSalesSummary | null>(null)

  useEffect(() => {
    void Promise.all([getSalesOverview(), getVendors(), getProducts()])
      .then(([overviewResult, vendorResult, productResult]) => {
        setOverview(overviewResult)
        setVendors(vendorResult)
        setProducts(productResult)
      })
      .catch(() => {
        setOverview(null)
        setVendors([])
        setProducts([])
      })
  }, [])

  const topProductColumns: CommonListColumn<VendorSalesSummary["topProducts"][number]>[] = [
    { id: "product", header: "Product", cell: (row) => row.productName },
    { id: "qty", header: "Qty", cell: (row) => row.totalQuantity },
    { id: "revenue", header: "Revenue", cell: (row) => row.totalRevenue.toFixed(2) },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-5">
        <div><Label>Total Orders</Label><Input value={overview?.totalOrders ?? 0} readOnly /></div>
        <div><Label>Total Sales</Label><Input value={overview?.totalSales ?? 0} readOnly /></div>
        <div><Label>Total Tax</Label><Input value={overview?.totalTax ?? 0} readOnly /></div>
        <div><Label>Total Discounts</Label><Input value={overview?.totalDiscounts ?? 0} readOnly /></div>
        <div><Label>Vendor Earnings</Label><Input value={overview?.totalVendorEarnings ?? 0} readOnly /></div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-2">
        <div className="space-y-3">
          <Label>Vendor Analytics</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={vendorId} onChange={(event) => setVendorId(event.target.value)}>
            <option value="">Select vendor</option>
            {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.companyName}</option>)}
          </select>
          <Button onClick={() => vendorId ? void getVendorSalesSummary(Number(vendorId)).then(setVendorSummary).catch(() => setVendorSummary(null)) : undefined}>Load Vendor Summary</Button>
          {vendorSummary ? <div className="grid gap-2 rounded-md border p-3 text-sm"><span>Orders: {vendorSummary.totalOrders}</span><span>Sales: {vendorSummary.totalSales.toFixed(2)}</span><span>Earnings: {vendorSummary.totalEarnings.toFixed(2)}</span></div> : null}
        </div>

        <div className="space-y-3">
          <Label>Product Analytics</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={productId} onChange={(event) => setProductId(event.target.value)}>
            <option value="">Select product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <Button onClick={() => productId ? void getProductSalesSummary(Number(productId)).then(setProductSummary).catch(() => setProductSummary(null)) : undefined}>Load Product Summary</Button>
          {productSummary ? <div className="grid gap-2 rounded-md border p-3 text-sm"><span>Quantity: {productSummary.totalQuantity}</span><span>Revenue: {productSummary.totalRevenue.toFixed(2)}</span></div> : null}
        </div>
      </section>

      {vendorSummary ? (
        <CommonList
          header={{ pageTitle: "Vendor Analytics", pageDescription: `Top products for ${vendorSummary.vendorCompanyName}.` }}
          table={{ columns: topProductColumns, data: vendorSummary.topProducts, emptyMessage: "No product analytics found." }}
        />
      ) : null}
    </div>
  )
}
