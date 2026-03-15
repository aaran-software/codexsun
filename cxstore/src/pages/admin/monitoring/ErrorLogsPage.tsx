import { useEffect, useMemo, useState } from "react"

import { getErrorLogs } from "@/api/monitoringApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ErrorLogEntry } from "@/types/monitoring"

const PAGE_SIZE = 20

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([])
  const [search, setSearch] = useState("")
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<ErrorLogEntry | null>(null)

  useEffect(() => {
    void getErrorLogs({ service, date })
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [service, date])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return logs.filter((log) =>
      term.length === 0
      || log.service.toLowerCase().includes(term)
      || log.exceptionMessage.toLowerCase().includes(term)
      || log.path.toLowerCase().includes(term)
      || log.username.toLowerCase().includes(term)
      || log.email.toLowerCase().includes(term))
  }, [logs, search])

  useEffect(() => {
    setPage(1)
  }, [search, service, date])

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const columns: CommonListColumn<ErrorLogEntry>[] = [
    { id: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleString(), accessor: (row) => new Date(row.createdAt), sortable: true },
    { id: "service", header: "Service", cell: (row) => row.service },
    { id: "message", header: "Message", cell: (row) => row.exceptionMessage },
    { id: "path", header: "Path", cell: (row) => row.path },
    { id: "user", header: "User", cell: (row) => row.username || row.email || "Anonymous" },
    {
      id: "stackTrace",
      header: "Stack Trace",
      cell: (row) => <Button size="sm" variant="outline" onClick={() => setSelectedLog(row)}>View</Button>,
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Service</Label>
          <Input value={service} onChange={(event) => setService(event.target.value)} placeholder="API" />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => { setService(""); setDate("") }}>Clear Filters</Button>
        </div>
      </section>

      <CommonList
        header={{ pageTitle: "Error Logs", pageDescription: "Inspect application exceptions, request paths, and impacted users." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by service, message, path, or user" }}
        table={{ columns, data: paged, emptyMessage: "No error logs found." }}
        pagination={{
          currentPage: page,
          pageSize: PAGE_SIZE,
          totalRecords: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: () => undefined,
          pageSizeOptions: [PAGE_SIZE],
        }}
      />

      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
          </DialogHeader>
          {selectedLog ? (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <div><span className="font-medium">Service:</span> {selectedLog.service}</div>
                <div><span className="font-medium">Path:</span> {selectedLog.path}</div>
                <div><span className="font-medium">User:</span> {selectedLog.username || selectedLog.email || "Anonymous"}</div>
                <div><span className="font-medium">IP:</span> {selectedLog.ipAddress}</div>
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <pre className="rounded-md border bg-muted p-3 text-xs">{selectedLog.exceptionMessage}</pre>
              </div>
              <div className="grid gap-2">
                <Label>Stack Trace</Label>
                <pre className="max-h-72 overflow-auto rounded-md border bg-muted p-3 text-xs">{selectedLog.stackTrace || "No stack trace captured."}</pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
