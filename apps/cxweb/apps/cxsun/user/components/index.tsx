// apps/cxsun/react/user/index.tsx

import React from 'react'
import { DataTable } from '../../../resources/components/data-table/DataTable'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersDialogs } from './components/users-dialogs'
import { usersColumns } from './components/users-columns'
import { DataTableBulkActions } from './components/data-table-bulk-actions'
import { type User } from './data/schema'
import { callTypes } from './data/data'
import Loader from '../../../resources/components/loader/loader'
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'

function UserPageContent() {
  const { users, isLoading, error, fetchUsers } = useUsers()
  const table = useReactTable({
    data: users,
    columns: usersColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) return <Loader />
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      <DataTable
        columns={usersColumns}
        data={users}
        fetchData={fetchUsers}
        searchKey="name"
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: Array.from(callTypes).map(([value]) => ({
              label: value.charAt(0).toUpperCase() + value.slice(1),
              value,
            })),
          },
        ]}
        entityName="user"
        bulkActions={<DataTableBulkActions table={table} />}
      />
      <UsersDialogs />
    </div>
  )
}

export default function UserPage() {
  return (
    <UsersProvider>
      <UserPageContent />
    </UsersProvider>
  )
}
