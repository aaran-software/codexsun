import type { ShippingMethodOption } from "@/types/storefront"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/storefront"

export function ShippingOptions({
  options,
  value,
  onChange,
}: {
  options: ShippingMethodOption[]
  value: string
  onChange: (option: ShippingMethodOption) => void
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={cn(
            "rounded-[1.6rem] border px-4 py-4 text-left transition",
            value === option.id ? "border-primary bg-primary/5" : "border-border/60 bg-card",
          )}
          onClick={() => onChange(option)}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{option.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(option.cost)}</div>
              <div className="text-xs text-muted-foreground">{option.eta}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
