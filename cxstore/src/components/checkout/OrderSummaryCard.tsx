import { formatCurrency } from "@/utils/storefront"

export function OrderSummaryCard({
  subtotal,
  discount,
  shipping,
  total,
}: {
  subtotal: number
  discount: number
  shipping: number
  total: number
}) {
  return (
    <div className="rounded-[1.8rem] border border-border/60 bg-card p-5">
      <div className="text-lg font-semibold">Order Summary</div>
      <div className="mt-4 space-y-3 text-sm">
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryRow label="Discount" value={`-${formatCurrency(discount)}`} />
        <SummaryRow label="Shipping" value={formatCurrency(shipping)} />
        <SummaryRow label="Total" value={formatCurrency(total)} emphasized />
      </div>
    </div>
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
