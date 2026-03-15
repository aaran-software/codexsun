import { useEffect, useMemo, useState } from "react"

import { createNotificationTemplate, getNotificationTemplates, updateNotificationTemplate } from "@/api/notificationApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NotificationChannel, NotificationTemplate } from "@/types/notification"

const channels: NotificationChannel[] = ["Email", "SMS", "WhatsApp", "InApp"]

const emptyForm = {
  code: "",
  name: "",
  channel: "Email" as NotificationChannel,
  subject: "",
  templateBody: "",
  isActive: true,
}

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [error, setError] = useState("")

  async function loadData() {
    setTemplates(await getNotificationTemplates())
  }

  useEffect(() => {
    void loadData().catch(() => setTemplates([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return templates.filter((template) =>
      term.length === 0
      || template.code.toLowerCase().includes(term)
      || template.name.toLowerCase().includes(term)
      || template.channel.toLowerCase().includes(term))
  }, [search, templates])

  const columns: CommonListColumn<NotificationTemplate>[] = [
    { id: "code", header: "Code", cell: (row) => row.code },
    { id: "name", header: "Name", cell: (row) => row.name },
    { id: "channel", header: "Channel", cell: (row) => row.channel },
    { id: "subject", header: "Subject", cell: (row) => row.subject },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge>,
    },
    {
      id: "edit",
      header: "Action",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedTemplateId(row.id)
            setForm({
              code: row.code,
              name: row.name,
              channel: row.channel,
              subject: row.subject,
              templateBody: row.templateBody,
              isActive: row.isActive,
            })
          }}
        >
          Edit
        </Button>
      ),
    },
  ]

  async function handleSubmit() {
    setError("")

    try {
      if (selectedTemplateId) {
        await updateNotificationTemplate(selectedTemplateId, form)
      } else {
        await createNotificationTemplate(form)
      }

      setSelectedTemplateId(null)
      setForm(emptyForm)
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save notification template.")
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></div>
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
        <div className="space-y-2">
          <Label>Channel</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value as NotificationChannel }))}>
            {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2"><Label>Subject</Label><Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} /></div>
        <div className="space-y-2 flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
            Active
          </label>
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label>Template Body</Label>
          <textarea className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.templateBody} onChange={(event) => setForm((current) => ({ ...current, templateBody: event.target.value }))} />
        </div>
        <div className="flex gap-2 md:col-span-3">
          <Button onClick={() => void handleSubmit()}>{selectedTemplateId ? "Update Template" : "Create Template"}</Button>
          {selectedTemplateId ? <Button variant="outline" onClick={() => { setSelectedTemplateId(null); setForm(emptyForm) }}>Reset</Button> : null}
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-3">{error}</p> : null}
      </section>

      <CommonList
        header={{ pageTitle: "Notification Templates", pageDescription: "Manage channel-specific notification templates and event codes." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search templates" }}
        table={{ columns, data: filtered, emptyMessage: "No notification templates found." }}
      />
    </div>
  )
}
