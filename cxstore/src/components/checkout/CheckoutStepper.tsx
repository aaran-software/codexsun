import type { CheckoutStep } from "@/types/storefront"
import { cn } from "@/lib/utils"

export function CheckoutStepper({ steps, currentStep }: { steps: CheckoutStep[]; currentStep: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isComplete = steps.findIndex((candidate) => candidate.id === currentStep) > index

        return (
          <div
            key={step.id}
            className={cn(
              "rounded-[1.6rem] border px-4 py-3 text-sm shadow-sm",
              isActive ? "border-primary bg-primary text-primary-foreground" : isComplete ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground",
            )}
          >
            <div className="text-[11px] uppercase tracking-[0.24em]">Step {index + 1}</div>
            <div className="mt-1 font-medium">{step.label}</div>
          </div>
        )
      })}
    </div>
  )
}
