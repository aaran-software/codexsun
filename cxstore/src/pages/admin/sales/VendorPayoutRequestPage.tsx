import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { createVendorPayout } from "@/api/salesApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function VendorPayoutRequestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const listPath = isVendorRoute ? "/vendor/sales/vendor-payouts" : "/admin/sales/vendor-payouts"
  const [vendorUserId, setVendorUserId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      await createVendorPayout(isVendorRoute ? undefined : vendorUserId || undefined)
      navigate(listPath)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to request payout.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Vendor Payout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        {!isVendorRoute ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor User Id</label>
            <Input value={vendorUserId} onChange={(event) => setVendorUserId(event.target.value)} />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">This request will settle all available unpaid earnings for the current vendor account.</div>
        )}
        <div className="flex justify-end">
          <Button type="button" onClick={() => void handleSubmit()}>Create Payout Request</Button>
        </div>
      </CardContent>
    </Card>
  )
}
