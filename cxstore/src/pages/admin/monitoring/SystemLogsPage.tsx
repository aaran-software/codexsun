import { useEffect, useMemo, useState } from "react"

import { getSystemLogs } from "@/api/monitoringApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SystemLogEntry } from "@/types/monitoring"

const PAGE_SIZE = 20

function getSeverityVariant(severity: string) {
  if (severity === "Critical") {
    return "destructive" as const
  }

  if (severity === "Warning") {
    return "secondary" as const
  }

  return "outline" as const
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([])
  const [search, setSearch] = useState("")
  const [service, setService] = useState("")
  const [severity, setSeverity] = useState("")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    void getSystemLogs({ service, severity, date })
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [service, severity, date])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return logs.filter((log) =>
      term.length === 0
      || log.service.toLowerCase().includes(term)
      || log.eventType.toLowerCase().includes(term)
      || log.message.toLowerCase().includes(term)
      || log.details.toLowerCase().includes(term))
  }, [logs, search])

  useEffect(() => {
    setPage(1)
  }, [search, service, severity, date])

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const columns: CommonListColumn<SystemLogEntry>[] = [
    { id: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleString(), accessor: (row) => new Date(row.createdAt), sortable: true },
    { id: "service", header: "Service", cell: (row) => row.service },
    { id: "event", header: "Event", cell: (row) => row.eventType },
    { id: "severity", header: "Severity", cell: (row) => <Badge variant={getSeverityVariant(row.severity)}>{row.severity}</Badge> },
    { id: "message", header: "Message", cell: (row) => row.message },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Input value={service} onChange={(event) => setService(event.target.value)} placeholder="InventoryService" />
        </div>
        <div className="space-y-2">
          <Label>Severity</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="">All severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
            <option value="Debug">Debug</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => { setService(""); setSeverity(""); setDate("") }}>Clear Filters</Button>
        </div>
      </section>

      <CommonList
        header={{ pageTitle: "System Logs", pageDescription: "Track internal operations, workers, security alerts, and service-level events." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by service, event, message, or details" }}
        table={{ columns, data: paged, emptyMessage: "No system logs found." }}
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
