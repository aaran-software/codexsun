import type { PaymentMethodOption } from "@/types/storefront"
import { cn } from "@/lib/utils"

export function PaymentSelector({
  options,
  value,
  onChange,
}: {
  options: PaymentMethodOption[]
  value: string
  onChange: (option: PaymentMethodOption) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
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
          <div className="font-medium">{option.label}</div>
          <div className="mt-1 text-sm text-muted-foreground">{option.description}</div>
        </button>
      ))}
    </div>
  )
}
