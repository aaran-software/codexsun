import { Trash2Icon } from "lucide-react"

import { QuantitySelector } from "@/components/product/QuantitySelector"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/types/sales"
import { formatCurrency } from "@/utils/storefront"

export function CartItemCard({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: CartItem
  onRemove: () => void
  onQuantityChange: (quantity: number) => void
}) {
  return (
    <div className="grid gap-4 rounded-[1.8rem] border border-border/60 bg-card p-5 lg:grid-cols-[1fr_auto]">
      <div className="space-y-2">
        <div className="text-lg font-semibold">{item.productName}</div>
        <div className="text-sm text-muted-foreground">{item.productSku}{item.productVariantName ? ` - ${item.productVariantName}` : ""}</div>
        {item.vendorName ? <div className="text-sm text-muted-foreground">Sold by {item.vendorName}</div> : null}
        <div className="text-base font-semibold">{formatCurrency(item.unitPrice)}</div>
      </div>
      <div className="flex flex-col items-start gap-3 lg:items-end">
        <QuantitySelector value={item.quantity} onChange={onQuantityChange} />
        <div className="text-sm font-medium text-muted-foreground">Subtotal {formatCurrency(item.totalPrice)}</div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={onRemove}>
          <Trash2Icon className="size-4" />
          Remove
        </Button>
      </div>
    </div>
  )
}
