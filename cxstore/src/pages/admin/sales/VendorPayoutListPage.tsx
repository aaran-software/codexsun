import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { approveVendorPayout, getVendorPayouts } from "@/api/salesApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import type { VendorPayoutSummary } from "@/types/sales"

export default function VendorPayoutListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [payouts, setPayouts] = useState<VendorPayoutSummary[]>([])
  const [search, setSearch] = useState("")

  const load = async () => {
    try {
      setPayouts(await getVendorPayouts())
    } catch {
      setPayouts([])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return payouts.filter((payout) => term.length === 0 || payout.payoutNumber.toLowerCase().includes(term) || payout.vendorName.toLowerCase().includes(term))
  }, [payouts, search])

  const createPath = location.pathname.startsWith("/vendor") ? "/vendor/sales/vendor-payouts/request" : "/admin/sales/vendor-payouts/request"
  const columns: CommonListColumn<VendorPayoutSummary>[] = [
    { id: "number", header: "Payout", cell: (row) => row.payoutNumber },
    { id: "vendor", header: "Vendor", cell: (row) => row.vendorName },
    { id: "amount", header: "Amount", cell: (row) => row.amount.toFixed(2) },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Badge className={row.status === "Paid" ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-amber-500 text-white hover:bg-amber-500/90"}>{row.status}</Badge>
          {!location.pathname.startsWith("/vendor") && row.status === "Pending" ? (
            <button type="button" className="text-xs font-medium text-primary" onClick={() => void approveVendorPayout(row.id, true).then(load)}>Approve</button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <CommonList
      header={{ pageTitle: "Vendor Payouts", pageDescription: "Manage marketplace settlements and vendor cash-out requests.", addLabel: "Request Payout", onAddClick: () => navigate(createPath) }}
      search={{ value: search, onChange: setSearch, placeholder: "Search vendor payouts" }}
      table={{ columns, data: filtered, emptyMessage: "No vendor payouts found." }}
      footer={{ content: <span>Total payouts: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
    />
  )
}
