import { useEffect, useMemo, useState } from "react"

import { getAuditLogs } from "@/api/monitoringApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuditLogEntry } from "@/types/monitoring"

const PAGE_SIZE = 20

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [search, setSearch] = useState("")
  const [module, setModule] = useState("")
  const [action, setAction] = useState("")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  async function loadData() {
    const result = await getAuditLogs({
      module,
      action,
      date,
    })
    setLogs(result)
  }

  useEffect(() => {
    void loadData().catch(() => setLogs([]))
  }, [module, action, date])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return logs.filter((log) =>
      term.length === 0
      || log.username.toLowerCase().includes(term)
      || log.email.toLowerCase().includes(term)
      || log.action.toLowerCase().includes(term)
      || log.entityType.toLowerCase().includes(term)
      || log.entityId.toLowerCase().includes(term)
      || log.module.toLowerCase().includes(term)
      || log.ipAddress.toLowerCase().includes(term))
  }, [logs, search])

  useEffect(() => {
    setPage(1)
  }, [search, module, action, date])

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const columns: CommonListColumn<AuditLogEntry>[] = [
    { id: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleString(), accessor: (row) => new Date(row.createdAt), sortable: true },
    { id: "user", header: "User", cell: (row) => row.username || row.email || "System" },
    { id: "module", header: "Module", cell: (row) => <Badge variant="secondary">{row.module || "System"}</Badge> },
    { id: "action", header: "Action", cell: (row) => row.action },
    { id: "entity", header: "Entity", cell: (row) => `${row.entityType}${row.entityId ? ` #${row.entityId}` : ""}` },
    { id: "ip", header: "IP", cell: (row) => row.ipAddress },
    {
      id: "changes",
      header: "Changes",
      cell: (row) => <Button size="sm" variant="outline" onClick={() => setSelectedLog(row)}>View</Button>,
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Module</Label>
          <Input value={module} onChange={(event) => setModule(event.target.value)} placeholder="Products, Sales, Auth" />
        </div>
        <div className="space-y-2">
          <Label>Action</Label>
          <Input value={action} onChange={(event) => setAction(event.target.value)} placeholder="Update Product" />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => { setModule(""); setAction(""); setDate("") }}>Clear Filters</Button>
        </div>
      </section>

      <CommonList
        header={{ pageTitle: "Audit Logs", pageDescription: "Review user actions, data changes, and mutating API activity across the platform." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by user, module, action, entity, or IP" }}
        table={{ columns, data: paged, emptyMessage: "No audit logs found." }}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Change Details</DialogTitle>
          </DialogHeader>
          {selectedLog ? (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <div><span className="font-medium">Action:</span> {selectedLog.action}</div>
                <div><span className="font-medium">Module:</span> {selectedLog.module}</div>
                <div><span className="font-medium">User:</span> {selectedLog.username || selectedLog.email || "System"}</div>
                <div><span className="font-medium">IP:</span> {selectedLog.ipAddress}</div>
              </div>
              <div className="grid gap-2">
                <Label>Old Values</Label>
                <pre className="max-h-56 overflow-auto rounded-md border bg-muted p-3 text-xs">{selectedLog.oldValues || "No previous value captured."}</pre>
              </div>
              <div className="grid gap-2">
                <Label>New Values</Label>
                <pre className="max-h-56 overflow-auto rounded-md border bg-muted p-3 text-xs">{selectedLog.newValues || "No new value captured."}</pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
