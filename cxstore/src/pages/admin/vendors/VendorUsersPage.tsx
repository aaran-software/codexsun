import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { assignVendorUser, getVendorUsers } from "@/api/vendorApi"
import { getUsers } from "@/api/userApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdminUserSummary } from "@/types/admin"
import type { VendorUserSummary } from "@/types/vendor"

const vendorRoles = ["Owner", "Manager", "Staff"] as const

export default function VendorUsersPage() {
  const params = useParams()
  const vendorId = Number(params.id)
  const [vendorUsers, setVendorUsers] = useState<VendorUserSummary[]>([])
  const [availableUsers, setAvailableUsers] = useState<AdminUserSummary[]>([])
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("Staff")
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const [users, assignedUsers] = await Promise.all([
        getUsers(),
        getVendorUsers(vendorId),
      ])

      setAvailableUsers(users.filter((user) => user.role === "Vendor" && !user.isDeleted))
      setVendorUsers(assignedUsers)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vendor users.")
    }
  }

  useEffect(() => {
    if (Number.isFinite(vendorId)) {
      void load()
    }
  }, [vendorId])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return vendorUsers.filter((user) =>
      term.length === 0
      || user.username.toLowerCase().includes(term)
      || user.email.toLowerCase().includes(term)
      || user.role.toLowerCase().includes(term))
  }, [vendorUsers, search])

  const handleAssign = async () => {
    setError(null)

    try {
      await assignVendorUser(vendorId, {
        userId: selectedUserId,
        role: selectedRole,
      })
      setSelectedUserId("")
      setSelectedRole("Staff")
      await load()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to assign vendor user.")
    }
  }

  const columns: CommonListColumn<VendorUserSummary>[] = [
    { id: "username", header: "Username", cell: (row) => row.username },
    { id: "email", header: "Email", cell: (row) => row.email },
    { id: "role", header: "Vendor Role", cell: (row) => row.role },
    { id: "created", header: "Assigned", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Vendor User</Label>
          <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select vendor user" /></SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value ?? "Staff")}>
            <SelectTrigger><SelectValue placeholder="Select vendor role" /></SelectTrigger>
            <SelectContent>
              {vendorRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => void handleAssign()}>Assign User</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-3">{error}</p> : null}
      </section>

      <CommonList
        header={{ pageTitle: "Vendor Users", pageDescription: "Assign multiple vendor staff users under the same vendor company." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search assigned users" }}
        table={{ columns, data: filtered, emptyMessage: "No vendor users assigned." }}
        footer={{ content: <span>Total assigned users: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
      />
    </div>
  )
}
