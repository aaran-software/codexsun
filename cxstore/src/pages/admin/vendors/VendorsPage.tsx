import { useEffect, useMemo, useState } from "react"
import { EditIcon, MoreHorizontalIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { getVendors } from "@/api/vendorApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { VendorSummary } from "@/types/vendor"

export default function VendorsPage() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setError(null)
      setVendors(await getVendors())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vendors.")
    } finally {
      setLoading(false)
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

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedVendors = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const columns: CommonListColumn<VendorSummary>[] = [
    {
      id: "serialNumber",
      header: "Sl.No",
      cell: (row) => ((safeCurrentPage - 1) * pageSize) + paginatedVendors.findIndex((item) => item.id === row.id) + 1,
      className: "w-12 min-w-12 px-2 text-center text-foreground",
      headerClassName: "w-12 min-w-12 px-2 text-center",
      sticky: "left",
    },
    {
      id: "company",
      header: "Company",
      accessor: (row) => row.companyName,
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{row.companyName}</div>
          <div className="text-xs text-muted-foreground">{row.email || "No email configured"}</div>
        </div>
      ),
    },
    { id: "legal", header: "Legal Name", accessor: (row) => row.legalName || "", sortable: true, cell: (row) => row.legalName || "-" },
    { id: "gst", header: "GST", accessor: (row) => row.gstNumber || "", sortable: true, cell: (row) => row.gstNumber || "-" },
    { id: "email", header: "Email", accessor: (row) => row.email || "", sortable: true, cell: (row) => row.email || "-" },
    { id: "users", header: "Users", accessor: (row) => row.userCount, sortable: true, cell: (row) => row.userCount },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <Badge className={row.status.toLowerCase() === "active"
          ? "bg-emerald-500 text-white hover:bg-emerald-500/90"
          : "bg-slate-500 text-white hover:bg-slate-500/90"}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sticky: "right",
      className: "w-16 min-w-16 text-center",
      headerClassName: "w-16 min-w-16 text-center",
      cell: (row) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button type="button" size="icon" variant="ghost" className="size-8 rounded-md data-[state=open]:bg-accent" />
              )}
            >
              <MoreHorizontalIcon className="size-4 stroke-[2.5]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-0 w-auto whitespace-nowrap">
              <DropdownMenuItem onClick={() => navigate(`/admin/vendors/${row.id}`)}>
                <EditIcon className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/vendors/${row.id}/users`)}>
                <UsersIcon className="size-4" />
                <span>Users</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled variant="destructive">
                <Trash2Icon className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <CommonList
        header={{
          pageTitle: "Vendors",
          pageDescription: "Manage vendor companies, tax profiles, and business onboarding.",
          addLabel: "New Vendor",
          onAddClick: () => navigate("/admin/vendors/create"),
        }}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value)
            setCurrentPage(1)
          },
          placeholder: "Search vendor companies by name, email, GST, or status",
        }}
        table={{
          columns,
          data: paginatedVendors,
          loading,
          emptyMessage: "No vendors found.",
          rowKey: (vendor) => vendor.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total records: <span className="font-medium text-foreground">{totalRecords}</span>
              </span>
              <span>
                Active records: <span className="font-medium text-foreground">{filtered.filter((vendor) => vendor.status.toLowerCase() === "active").length}</span>
              </span>
            </div>
          ),
        }}
        pagination={{
          currentPage: safeCurrentPage,
          pageSize,
          totalRecords,
          onPageChange: setCurrentPage,
          onPageSizeChange: (value) => {
            setPageSize(value)
            setCurrentPage(1)
          },
        }}
      />
    </div>
  )
}
