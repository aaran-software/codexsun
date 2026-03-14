import { useEffect, useMemo, useState } from "react"
import { EditIcon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { deleteContact, getContacts } from "@/api/contactApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ContactSummary } from "@/types/contact"

export default function ContactsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [contacts, setContacts] = useState<ContactSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const basePath = location.pathname.startsWith("/vendor") ? "/vendor/contacts" : "/admin/contacts"
  const pageTitle = location.pathname.startsWith("/vendor") ? "My Contacts" : "Contact Management"

  const loadContacts = async () => {
    setLoading(true)
    setError(null)

    try {
      setContacts(await getContacts(showInactive))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load contacts.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadContacts()
  }, [showInactive])

  const filteredContacts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    return contacts.filter((contact) => normalizedSearch.length === 0
      || contact.displayName.toLowerCase().includes(normalizedSearch)
      || contact.primaryEmail.toLowerCase().includes(normalizedSearch)
      || contact.primaryPhone.toLowerCase().includes(normalizedSearch)
      || contact.contactTypeName.toLowerCase().includes(normalizedSearch))
  }, [contacts, searchValue])

  const totalRecords = filteredContacts.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedContacts = filteredContacts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const handleDelete = async (id: number) => {
    setError(null)
    setMessage(null)

    try {
      await deleteContact(id)
      setMessage("Contact deleted successfully.")
      await loadContacts()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete contact.")
    }
  }

  const columns: CommonListColumn<ContactSummary>[] = [
    {
      id: "serialNumber",
      header: "Sl.No",
      cell: (contact) => ((safeCurrentPage - 1) * pageSize) + paginatedContacts.findIndex((item) => item.id === contact.id) + 1,
      className: "w-12 min-w-12 px-2 text-center text-foreground",
      headerClassName: "w-12 min-w-12 px-2 text-center",
      sticky: "left",
    },
    {
      id: "displayName",
      header: "Contact",
      accessor: (contact) => contact.displayName,
      sortable: true,
      cell: (contact) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{contact.displayName}</div>
          <div className="text-xs text-muted-foreground">{contact.contactTypeName || "General"}</div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessor: (contact) => contact.primaryEmail,
      sortable: true,
      cell: (contact) => contact.primaryEmail || "-",
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (contact) => contact.primaryPhone,
      sortable: true,
      cell: (contact) => contact.primaryPhone || "-",
    },
    {
      id: "flags",
      header: "Usage",
      cell: (contact) => (
        <div className="flex flex-wrap gap-2">
          {contact.isCustomer ? <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">Customer</Badge> : null}
          {contact.isSupplier ? <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">Supplier</Badge> : null}
          {contact.isVendorContact ? <Badge className="bg-violet-500 text-white hover:bg-violet-500/90">Vendor</Badge> : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (contact) => String(contact.isActive),
      sortable: true,
      cell: (contact) => (
        <Badge className={contact.isActive ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-slate-500 text-white hover:bg-slate-500/90"}>
          {contact.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sticky: "right",
      className: "w-16 min-w-16 text-center",
      headerClassName: "w-16 min-w-16 text-center",
      cell: (contact) => (
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
              <DropdownMenuItem onClick={() => navigate(`${basePath}/${contact.id}`)}>
                <EyeIcon className="size-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${basePath}/edit/${contact.id}`)}>
                <EditIcon className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => void handleDelete(contact.id)}>
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
    <div className="space-y-6">
      {message ? <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{message}</div> : null}
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <CommonList
        header={{
          pageTitle,
          pageDescription: "Manage customers, suppliers, staff contacts, and vendor contacts from one place.",
          addLabel: "New Contact",
          onAddClick: () => navigate(`${basePath}/create`),
        }}
        search={{
          value: searchValue,
          onChange: (value) => {
            setSearchValue(value)
            setCurrentPage(1)
          },
          placeholder: "Search contacts by name, email, phone, or type",
        }}
        filters={{
          buttonLabel: "Contact filters",
          options: [
            { key: "active", label: showInactive ? "Hide inactive" : "Show inactive", onSelect: () => setShowInactive((current) => !current) },
          ],
        }}
        table={{
          columns,
          data: paginatedContacts,
          loading,
          emptyMessage: "No contacts found.",
          rowKey: (contact) => contact.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total records: <span className="font-medium text-foreground">{totalRecords}</span>
              </span>
              <span>
                Active records: <span className="font-medium text-foreground">{filteredContacts.filter((contact) => contact.isActive).length}</span>
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
