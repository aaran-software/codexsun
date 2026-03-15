import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CouponInput({
  onApply,
  appliedCode,
}: {
  onApply: (code: string) => Promise<string>
  appliedCode: string
}) {
  const [code, setCode] = useState(appliedCode)
  const [message, setMessage] = useState("")

  return (
    <div className="space-y-3 rounded-[1.6rem] border border-border/60 bg-card p-5">
      <div className="text-sm font-medium">Coupon Code</div>
      <div className="flex gap-2">
        <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ENTER CODE" />
        <Button
          className="rounded-full"
          onClick={() => void onApply(code).then(setMessage)}
        >
          Apply
        </Button>
      </div>
      {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
    </div>
  )
}
