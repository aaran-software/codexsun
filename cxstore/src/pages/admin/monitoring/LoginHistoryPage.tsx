import { useEffect, useMemo, useState } from "react"

import { getLoginHistory } from "@/api/monitoringApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LoginHistoryEntry } from "@/types/monitoring"

const PAGE_SIZE = 20

function getStatusVariant(status: string) {
  if (status === "Failed" || status === "Blocked") {
    return "destructive" as const
  }

  return "default" as const
}

export default function LoginHistoryPage() {
  const [entries, setEntries] = useState<LoginHistoryEntry[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [ip, setIp] = useState("")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    void getLoginHistory({ status, ip, date })
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [status, ip, date])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return entries.filter((entry) =>
      term.length === 0
      || entry.username.toLowerCase().includes(term)
      || entry.email.toLowerCase().includes(term)
      || entry.ipAddress.toLowerCase().includes(term)
      || entry.device.toLowerCase().includes(term)
      || entry.browser.toLowerCase().includes(term)
      || entry.os.toLowerCase().includes(term)
      || entry.loginStatus.toLowerCase().includes(term))
  }, [entries, search])

  useEffect(() => {
    setPage(1)
  }, [search, status, ip, date])

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const columns: CommonListColumn<LoginHistoryEntry>[] = [
    { id: "user", header: "User", cell: (row) => row.username || "Unknown" },
    { id: "email", header: "Email", cell: (row) => row.email },
    { id: "ip", header: "IP", cell: (row) => row.ipAddress },
    { id: "device", header: "Device", cell: (row) => row.device },
    { id: "browser", header: "Browser", cell: (row) => row.browser },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={getStatusVariant(row.loginStatus)}>{row.loginStatus}</Badge>,
    },
    { id: "login", header: "Login Time", cell: (row) => new Date(row.loginTime).toLocaleString(), accessor: (row) => new Date(row.loginTime), sortable: true },
    { id: "logout", header: "Logout Time", cell: (row) => row.logoutTime ? new Date(row.logoutTime).toLocaleString() : "-" },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>IP Address</Label>
          <Input value={ip} onChange={(event) => setIp(event.target.value)} placeholder="127.0.0.1" />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => { setStatus(""); setIp(""); setDate("") }}>Clear Filters</Button>
        </div>
      </section>

      <CommonList
        header={{ pageTitle: "Login History", pageDescription: "Track successful logins, failures, blocked attempts, and logout activity." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by user, email, IP, device, browser, OS, or status" }}
        table={{ columns, data: paged, emptyMessage: "No login history records found." }}
        pagination={{
          currentPage: page,
          pageSize: PAGE_SIZE,
          totalRecords: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: () => undefined,
          pageSizeOptions: [PAGE_SIZE],
        }}
      />
    </div>
  )
}
