import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { deleteUser, getUsers, restoreUser } from "@/api/userApi"
import { ListCommon, type ListCommonActiveFilter, type ListCommonColumn } from "@/components/admin/ListCommon"
import { Button } from "@/components/ui/button"
import type { AdminUserSummary } from "@/types/admin"

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      setUsers(await getUsers())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, statusFilter, pageSize])

  const handleDelete = async (id: string) => {
    setError(null)
    setMessage(null)

    try {
      await deleteUser(id)
      setMessage("User deleted successfully.")
      await loadUsers()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete user.")
    }
  }

  const handleRestore = async (id: string) => {
    setError(null)
    setMessage(null)

    try {
      await restoreUser(id)
      setMessage("User restored successfully.")
      await loadUsers()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to restore user.")
    }
  }

  const normalizedSearch = searchValue.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    const matchesSearch = normalizedSearch.length === 0
      || user.username.toLowerCase().includes(normalizedSearch)
      || user.email.toLowerCase().includes(normalizedSearch)
      || user.role.toLowerCase().includes(normalizedSearch)

    const matchesStatus = statusFilter === "all"
      || (statusFilter === "active" && !user.isDeleted)
      || (statusFilter === "deleted" && user.isDeleted)

    return matchesSearch && matchesStatus
  })

  const totalRecords = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedUsers = filteredUsers.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const activeFilters: ListCommonActiveFilter[] = statusFilter === "all"
    ? []
    : [{ key: "status", label: "Status", value: statusFilter === "active" ? "Active" : "Deleted" }]

  const columns: ListCommonColumn<AdminUserSummary>[] = [
    {
      id: "serialNumber",
      header: "SL No",
      cell: (user) => ((safeCurrentPage - 1) * pageSize) + paginatedUsers.findIndex((entry) => entry.id === user.id) + 1,
      className: "min-w-20 text-foreground",
      headerClassName: "min-w-20",
      sticky: "left",
    },
    {
      id: "username",
      header: "Username",
      sortable: true,
      accessor: (user) => user.username,
      cell: (user) => <span className="font-medium text-foreground">{user.username}</span>,
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      accessor: (user) => user.email,
      cell: (user) => user.email,
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      accessor: (user) => user.role,
      cell: (user) => user.role,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessor: (user) => `${user.status}${user.isDeleted ? "Deleted" : "Active"}`,
      cell: (user) => `${user.status}${user.isDeleted ? " (Deleted)" : ""}`,
    },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      accessor: (user) => new Date(user.createdAt),
      cell: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      className: "min-w-52 text-right",
      headerClassName: "min-w-52 text-right",
      sticky: "right",
      cell: (user) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" render={<Link to={`/admin/users/edit/${user.id}`} />}>
            Edit
          </Button>
          {user.isDeleted ? (
            <Button size="sm" onClick={() => void handleRestore(user.id)}>
              Restore
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => void handleDelete(user.id)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{message}</div> : null}
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <ListCommon
        header={{
          pageTitle: "User Management",
          pageDescription: "Manage platform users and roles",
          addLabel: "New User",
          onAddClick: () => navigate("/admin/users/create"),
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search users by username, email, or role",
        }}
        filters={{
          buttonLabel: "User filters",
          options: [
            { key: "all", label: "All users", isActive: statusFilter === "all", onSelect: () => setStatusFilter("all") },
            { key: "active", label: "Active users", isActive: statusFilter === "active", onSelect: () => setStatusFilter("active") },
            { key: "deleted", label: "Deleted users", isActive: statusFilter === "deleted", onSelect: () => setStatusFilter("deleted") },
          ],
          activeFilters,
          onRemoveFilter: (key) => {
            if (key === "status") {
              setStatusFilter("all")
            }
          },
          onClearAllFilters: () => {
            setStatusFilter("all")
          },
        }}
        table={{
          columns,
          data: paginatedUsers,
          loading,
          emptyMessage: "No users found.",
          rowKey: (user) => user.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total records: <span className="font-medium text-foreground">{totalRecords}</span>
              </span>
              <span>
                Deleted users: <span className="font-medium text-foreground">{filteredUsers.filter((user) => user.isDeleted).length}</span>
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
