import { useEffect, useState } from "react"

import { getNotificationSettings, updateNotificationSettings } from "@/api/notificationApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NotificationSettings } from "@/types/notification"

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void getNotificationSettings().then(setSettings).catch(() => setSettings(null))
  }, [])

  async function handleSave() {
    if (!settings) {
      return
    }

    setError("")
    try {
      setSettings(await updateNotificationSettings({
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        whatsAppEnabled: settings.whatsAppEnabled,
        inAppEnabled: settings.inAppEnabled,
        batchSize: settings.batchSize,
      }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update notification settings.")
    }
  }

  if (!settings) {
    return <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Loading notification settings...</div>
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Pending</Label><Input value={settings.pendingCount} readOnly /></div>
        <div className="space-y-2"><Label>Sent</Label><Input value={settings.sentCount} readOnly /></div>
        <div className="space-y-2"><Label>Failed</Label><Input value={settings.failedCount} readOnly /></div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.emailEnabled} onChange={(event) => setSettings((current) => current ? { ...current, emailEnabled: event.target.checked } : current)} />Email Enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.smsEnabled} onChange={(event) => setSettings((current) => current ? { ...current, smsEnabled: event.target.checked } : current)} />SMS Enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.whatsAppEnabled} onChange={(event) => setSettings((current) => current ? { ...current, whatsAppEnabled: event.target.checked } : current)} />WhatsApp Enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.inAppEnabled} onChange={(event) => setSettings((current) => current ? { ...current, inAppEnabled: event.target.checked } : current)} />In-App Enabled</label>
        <div className="space-y-2 md:col-span-2">
          <Label>Batch Size</Label>
          <Input type="number" min="1" value={settings.batchSize} onChange={(event) => setSettings((current) => current ? { ...current, batchSize: Number(event.target.value) } : current)} />
        </div>
        <div className="space-y-2">
          <Label>Supported Channels</Label>
          <Input value={settings.supportedChannels.join(", ")} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Registered Providers</Label>
          <Input value={settings.registeredProviders.join(", ")} readOnly />
        </div>
        <div className="md:col-span-2">
          <Button onClick={() => void handleSave()}>Save Notification Settings</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      </section>
    </div>
  )
}
