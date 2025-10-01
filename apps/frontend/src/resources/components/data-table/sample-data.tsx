import { useState, useEffect } from 'react'
import { DataTable } from './DataTable'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '../ui/checkbox'
import { DataTableColumnHeader } from './column-header'

type SampleData = {
  id: string
  name: string
  status: string
}

const columns: ColumnDef<SampleData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  },
]

export function SampleTablePage() {
  const [data, setData] = useState<SampleData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    // Replace with real API endpoint
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    return [
      { id: '1', name: 'Item 1', status: 'active' },
      { id: '2', name: 'Item 2', status: 'inactive' },
    ]
  }

  useEffect(() => {
    fetchData().then(data => {
      setData(data)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  return (
    <DataTable
      columns={columns}
      data={data}
      fetchData={fetchData}
      isLoading={isLoading}
      searchKey="name"
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      ]}
      entityName="item"
      bulkActions={
        <>
          <button>Custom Action</button>
        </>
      }
    />
  )
}