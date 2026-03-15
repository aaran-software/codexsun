import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/storefront"

export function CartSummaryCard({
  subtotal,
  discount,
  shipping,
  total,
  canCheckout,
}: {
  subtotal: number
  discount: number
  shipping: number
  total: number
  canCheckout: boolean
}) {
  return (
    <Card className="rounded-[1.8rem] border-border/60">
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          <SummaryRow label="Discount" value={`-${formatCurrency(discount)}`} />
          <SummaryRow label="Shipping" value={formatCurrency(shipping)} />
          <SummaryRow label="Total" value={formatCurrency(total)} emphasized />
        </div>
        <Button render={<Link to="/checkout" />} className="w-full rounded-full" disabled={!canCheckout}>
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={emphasized ? "flex items-center justify-between border-t pt-3 text-base font-semibold" : "flex items-center justify-between text-muted-foreground"}>
      <span>{label}</span>
      <span className={emphasized ? "text-foreground" : ""}>{value}</span>
    </div>
  )
}
