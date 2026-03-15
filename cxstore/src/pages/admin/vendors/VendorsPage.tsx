import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { createVendor, getVendors } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VendorSummary } from "@/types/vendor"

const emptyVendorForm = {
  companyName: "",
  legalName: "",
  gstNumber: "",
  panNumber: "",
  email: "",
  phone: "",
  website: "",
  logoUrl: "",
  status: "Active",
}

export default function VendorsPage() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyVendorForm)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setVendors(await getVendors())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vendors.")
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return vendors.filter((vendor) =>
      term.length === 0
      || vendor.companyName.toLowerCase().includes(term)
      || vendor.email.toLowerCase().includes(term)
      || vendor.status.toLowerCase().includes(term))
  }, [vendors, search])

  const handleCreate = async () => {
    setError(null)

    try {
      const created = await createVendor({
        ...form,
        addresses: [],
        bankAccounts: [],
      })
      setForm(emptyVendorForm)
      await load()
      navigate(`/admin/vendors/${created.id}`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create vendor.")
    }
  }

  const columns: CommonListColumn<VendorSummary>[] = [
    { id: "company", header: "Company", cell: (row) => row.companyName },
    { id: "legal", header: "Legal Name", cell: (row) => row.legalName || "-" },
    { id: "gst", header: "GST", cell: (row) => row.gstNumber || "-" },
    { id: "email", header: "Email", cell: (row) => row.email || "-" },
    { id: "users", header: "Users", cell: (row) => row.userCount },
    { id: "status", header: "Status", cell: (row) => row.status },
    {
      id: "actions",
      header: "Action",
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/vendors/${row.id}`)}>Details</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/vendors/${row.id}/users`)}>Users</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Legal Name</Label>
          <Input value={form.legalName} onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Input value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>GST</Label>
          <Input value={form.gstNumber} onChange={(event) => setForm((current) => ({ ...current, gstNumber: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>PAN</Label>
          <Input value={form.panNumber} onChange={(event) => setForm((current) => ({ ...current, panNumber: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => void handleCreate()}>Create Vendor</Button>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-4">{error}</p> : null}
      </section>

      <CommonList
        header={{
          pageTitle: "Vendors",
          pageDescription: "Manage vendor companies, tax profiles, and business onboarding.",
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search vendor companies" }}
        table={{ columns, data: filtered, emptyMessage: "No vendors found." }}
        footer={{ content: <span>Total vendors: <span className="font-medium text-foreground">{filtered.length}</span></span> }}
      />
    </div>
  )
}
