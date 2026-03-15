import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { getInvoices, recordPayment } from "@/api/salesApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InvoiceSummary } from "@/types/sales"

export default function PaymentCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isVendorRoute = location.pathname.startsWith("/vendor")
  const listPath = isVendorRoute ? "/vendor/sales/payments" : "/admin/sales/payments"
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [invoiceId, setInvoiceId] = useState("")
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [provider, setProvider] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getInvoices().then(setInvoices).catch(() => setInvoices([]))
  }, [])

  const handleSubmit = async () => {
    try {
      await recordPayment({
        invoiceId: Number(invoiceId),
        amount: Number(amount),
        transactionReference: reference,
        provider,
      })
      navigate(listPath)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to record payment.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {error ? <div className="md:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice</label>
          <Select value={invoiceId} onValueChange={(value) => setInvoiceId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
            <SelectContent>
              {invoices.map((invoice) => (
                <SelectItem key={invoice.id} value={String(invoice.id)}>{invoice.invoiceNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Reference</label>
          <Input value={reference} onChange={(event) => setReference(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Input value={provider} onChange={(event) => setProvider(event.target.value)} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="button" onClick={() => void handleSubmit()}>Save Payment</Button>
        </div>
      </CardContent>
    </Card>
  )
}
