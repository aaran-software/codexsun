import { useEffect, useState } from "react"
import { EditIcon, MoreHorizontalIcon, ShieldCheckIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { getRoles } from "@/api/roleApi"
import { CommonList, type CommonListActiveFilter, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RoleSummary } from "@/types/admin"

export default function RolesPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getRoles()
      .then(setRoles)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load roles.")
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, assignmentFilter, pageSize])

  const normalizedSearch = searchValue.trim().toLowerCase()
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = normalizedSearch.length === 0
      || role.name.toLowerCase().includes(normalizedSearch)
      || (role.description ?? "").toLowerCase().includes(normalizedSearch)

    const matchesAssignment = assignmentFilter === "all"
      || (assignmentFilter === "assigned" && role.userCount > 0)
      || (assignmentFilter === "unassigned" && role.userCount === 0)

    return matchesSearch && matchesAssignment
  })

  const totalRecords = filteredRoles.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedRoles = filteredRoles.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const activeFilters: CommonListActiveFilter[] = assignmentFilter === "all"
    ? []
    : [{
        key: "assignment",
        label: "Assignment",
        value: assignmentFilter === "assigned" ? "Assigned roles" : "Unassigned roles",
      }]

  const columns: CommonListColumn<RoleSummary>[] = [
    {
      id: "serialNumber",
      header: "SL No",
      cell: (role) => ((safeCurrentPage - 1) * pageSize) + paginatedRoles.findIndex((entry) => entry.id === role.id) + 1,
      className: "w-12 min-w-12 px-2 text-center text-foreground",
      headerClassName: "w-12 min-w-12 px-2 text-center",
      sticky: "left",
    },
    {
      id: "name",
      header: "Role",
      sortable: true,
      accessor: (role) => role.name,
      cell: (role) => <span className="font-medium text-foreground">{role.name}</span>,
    },
    {
      id: "description",
      header: "Description",
      sortable: true,
      accessor: (role) => role.description ?? "",
      cell: (role) => role.description,
    },
    {
      id: "userCount",
      header: "Users",
      sortable: true,
      accessor: (role) => role.userCount,
      cell: (role) => role.userCount.toString(),
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-12 min-w-12 px-2 text-center",
      headerClassName: "w-12 min-w-12 px-2 text-center",
      sticky: "right",
      cell: (role) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" size="icon-sm" variant="ghost" className="rounded-md font-semibold">
                  <MoreHorizontalIcon className="size-4 stroke-[2.5]" />
                  <span className="sr-only">Open role actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-0 w-auto whitespace-nowrap">
              <DropdownMenuItem onClick={() => navigate(`/admin/roles/edit/${role.id}`)}>
                <EditIcon className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/roles/${role.id}/permissions`)}>
                <ShieldCheckIcon className="size-4" />
                <span>Permissions</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <CommonList
        header={{
          pageTitle: "Role Management",
          pageDescription: "Manage roles and permissions",
          addLabel: "New Role",
          onAddClick: () => navigate("/admin/roles/create"),
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search roles by name or description",
        }}
        filters={{
          buttonLabel: "Role filters",
          options: [
            { key: "all", label: "All roles", isActive: assignmentFilter === "all", onSelect: () => setAssignmentFilter("all") },
            { key: "assigned", label: "Assigned roles", isActive: assignmentFilter === "assigned", onSelect: () => setAssignmentFilter("assigned") },
            { key: "unassigned", label: "Unassigned roles", isActive: assignmentFilter === "unassigned", onSelect: () => setAssignmentFilter("unassigned") },
          ],
          activeFilters,
          onRemoveFilter: (key) => {
            if (key === "assignment") {
              setAssignmentFilter("all")
            }
          },
          onClearAllFilters: () => {
            setAssignmentFilter("all")
          },
        }}
        table={{
          columns,
          data: paginatedRoles,
          loading,
          emptyMessage: "No roles found.",
          rowKey: (role) => role.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total roles: <span className="font-medium text-foreground">{totalRecords}</span>
              </span>
              <span>
                Roles with users: <span className="font-medium text-foreground">{filteredRoles.filter((role) => role.userCount > 0).length}</span>
              </span>
            </div>
          ),
        }}
        pagination={{
          currentPage: safeCurrentPage,
          pageSize,
          totalRecords,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  )
}
