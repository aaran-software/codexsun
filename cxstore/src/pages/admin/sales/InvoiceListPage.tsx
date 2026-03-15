import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { getInvoices } from "@/api/salesApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import type { InvoiceSummary } from "@/types/sales"

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    void getInvoices().then(setInvoices).catch(() => setInvoices([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return invoices.filter((invoice) => term.length === 0 || invoice.invoiceNumber.toLowerCase().includes(term) || invoice.customerName.toLowerCase().includes(term))
  }, [invoices, search])

  const basePath = location.pathname.startsWith("/vendor")
    ? "/vendor/sales/invoices"
    : location.pathname.startsWith("/account")
      ? "/account/invoices"
      : "/admin/sales/invoices"
  const columns: CommonListColumn<InvoiceSummary>[] = [
    { id: "number", header: "Invoice", cell: (row) => <button type="button" className="font-medium text-primary" onClick={() => navigate(`${basePath}/${row.id}`)}>{row.invoiceNumber}</button> },
    { id: "order", header: "Order", cell: (row) => row.orderNumber || "-" },
    { id: "customer", header: "Customer", cell: (row) => row.customerName || "-" },
    { id: "amount", header: "Total", cell: (row) => row.totalAmount.toFixed(2) },
    { id: "status", header: "Status", cell: (row) => <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">{row.status}</Badge> },
  ]

  return (
    <CommonList
      header={{ pageTitle: "Invoices", pageDescription: "Track issued invoices and payment readiness." }}
      search={{ value: search, onChange: setSearch, placeholder: "Search invoices" }}
      table={{ columns, data: filtered, emptyMessage: "No invoices found." }}
      footer={{ content: <span>Total invoices: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
