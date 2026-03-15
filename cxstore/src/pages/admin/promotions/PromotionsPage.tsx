import { useEffect, useState } from "react"

import { applyCoupon, createCoupon, createPromotion, getCoupons, getPromotions, validateCoupon } from "@/api/promotionApi"
import { getProducts } from "@/api/productApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Coupon, CouponValidationResponse, Promotion } from "@/types/promotion"
import type { ProductSummary } from "@/types/product"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [promotionName, setPromotionName] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [validation, setValidation] = useState<CouponValidationResponse | null>(null)
  const [validateAmount, setValidateAmount] = useState("0")
  const [applyOrderId, setApplyOrderId] = useState("")

  const load = async () => {
    const [promotionResult, couponResult, productResult] = await Promise.all([getPromotions(), getCoupons(), getProducts()])
    setPromotions(promotionResult)
    setCoupons(couponResult)
    setProducts(productResult)
  }

  useEffect(() => {
    void load().catch(() => {
      setPromotions([])
      setCoupons([])
      setProducts([])
    })
  }, [])

  const promotionColumns: CommonListColumn<Promotion>[] = [
    { id: "name", header: "Promotion", cell: (row) => row.name },
    { id: "discount", header: "Discount", cell: (row) => `${row.discountType} ${row.discountValue}` },
    { id: "products", header: "Products", cell: (row) => row.products.map((product) => product.productName).join(", ") || "All" },
  ]

  const couponColumns: CommonListColumn<Coupon>[] = [
    { id: "code", header: "Code", cell: (row) => row.code },
    { id: "discount", header: "Discount", cell: (row) => `${row.discountType} ${row.discountValue}` },
    { id: "usage", header: "Usage", cell: (row) => `${row.usedCount}/${row.usageLimit}` },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2"><Label>Promotion Name</Label><Input value={promotionName} onChange={(event) => setPromotionName(event.target.value)} /></div>
        <div className="space-y-2">
          <Label>Product</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
            <option value="">Select product</option>
            {products.slice(0, 20).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Coupon Code</Label><Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} /></div>
        <div className="flex items-end gap-2">
          <Button onClick={() => void createPromotion({ name: promotionName, description: "", discountType: "Percentage", discountValue: 10, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 30).toISOString(), isActive: true, productIds: selectedProductId ? [Number(selectedProductId)] : [] }).then(load)}>Create Promotion</Button>
          <Button variant="outline" onClick={() => void createCoupon({ code: couponCode, discountType: "Flat", discountValue: 100, usageLimit: 10, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 30).toISOString(), isActive: true }).then(load)}>Create Coupon</Button>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2"><Label>Coupon Code</Label><Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} /></div>
        <div className="space-y-2"><Label>Amount</Label><Input type="number" value={validateAmount} onChange={(event) => setValidateAmount(event.target.value)} /></div>
        <div className="space-y-2"><Label>Order Id</Label><Input type="number" value={applyOrderId} onChange={(event) => setApplyOrderId(event.target.value)} /></div>
        <div className="flex items-end gap-2">
          <Button onClick={() => void validateCoupon({ code: couponCode, amount: Number(validateAmount) }).then(setValidation)}>Validate</Button>
          <Button variant="outline" onClick={() => void applyCoupon({ code: couponCode, orderId: Number(applyOrderId) }).then(setValidation)}>Apply</Button>
        </div>
        {validation ? <p className="text-sm md:col-span-4">{validation.message} Discount: {validation.discountAmount}</p> : null}
      </section>

      <CommonList header={{ pageTitle: "Promotions", pageDescription: "Manage product promotions and coupon lifecycle." }} table={{ columns: promotionColumns, data: promotions, emptyMessage: "No promotions found." }} />
      <CommonList header={{ pageTitle: "Coupons", pageDescription: "Review coupon usage and active discount codes." }} table={{ columns: couponColumns, data: coupons, emptyMessage: "No coupons found." }} />
    </div>
  )
}
