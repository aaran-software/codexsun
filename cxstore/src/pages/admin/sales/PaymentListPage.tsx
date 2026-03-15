import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { getPayments } from "@/api/salesApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import type { PaymentSummary } from "@/types/sales"

export default function PaymentListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [payments, setPayments] = useState<PaymentSummary[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    void getPayments().then(setPayments).catch(() => setPayments([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return payments.filter((payment) => term.length === 0 || payment.invoiceNumber.toLowerCase().includes(term) || payment.transactionReference.toLowerCase().includes(term))
  }, [payments, search])

  const createPath = location.pathname.startsWith("/vendor") ? "/vendor/sales/payments/create" : "/admin/sales/payments/create"
  const columns: CommonListColumn<PaymentSummary>[] = [
    { id: "invoice", header: "Invoice", cell: (row) => row.invoiceNumber },
    { id: "method", header: "Method", cell: (row) => row.paymentMethodName || row.transactionReference || "-" },
    { id: "amount", header: "Amount", cell: (row) => row.amount.toFixed(2) },
    { id: "status", header: "Status", cell: (row) => <Badge className="bg-emerald-500 text-white hover:bg-emerald-500/90">{row.status}</Badge> },
  ]

  return (
    <CommonList
      header={{ pageTitle: "Payments", pageDescription: "Track received money against issued invoices.", addLabel: "Record Payment", onAddClick: () => navigate(createPath) }}
      search={{ value: search, onChange: setSearch, placeholder: "Search payments" }}
      table={{ columns, data: filtered, emptyMessage: "No payments found." }}
      footer={{ content: <span>Total payments: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
