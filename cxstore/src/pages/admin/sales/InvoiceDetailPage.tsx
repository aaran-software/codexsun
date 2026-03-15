import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { getInvoiceById } from "@/api/salesApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InvoiceDetail } from "@/types/sales"

export default function InvoiceDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)

  useEffect(() => {
    if (!params.id) {
      return
    }

    void getInvoiceById(Number(params.id)).then(setInvoice)
  }, [params.id])

  if (!invoice) {
    return <div className="text-sm text-muted-foreground">Loading invoice...</div>
  }

  const listPath = location.pathname.startsWith("/vendor")
    ? "/vendor/sales/invoices"
    : location.pathname.startsWith("/account")
      ? "/account/invoices"
      : "/admin/sales/invoices"

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => navigate(listPath)}>Back</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">{invoice.status}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Info label="Order" value={invoice.orderNumber || "-"} />
            <Info label="Customer" value={invoice.customerName || "-"} />
            <Info label="Tax" value={invoice.taxAmount.toFixed(2)} />
            <Info label="Total" value={invoice.totalAmount.toFixed(2)} />
          </div>
          <div className="space-y-3">
            <h3 className="font-medium">Items</h3>
            {invoice.items.map((item) => (
              <div key={item.id} className="rounded-md border p-3 text-sm">
                {item.description} • Qty {item.quantity} • {item.totalAmount.toFixed(2)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="space-y-1"><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div>{value}</div></div>
}
