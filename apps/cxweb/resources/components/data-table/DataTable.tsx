import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { DataTableToolbar } from './toolbar'
import { DataTablePagination } from './pagination'
import { DataTableBulkActions } from './bulk-actions'
import  Loader  from '../loader/loader'

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[] | null // Allow null for loading state
  fetchData?: () => Promise<TData[]> // Optional fetch function
  searchKey?: string // For search filter
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  }[]
  bulkActions?: React.ReactNode // Custom bulk actions
  entityName?: string // For bulk actions toolbar
  isLoading?: boolean // Explicit loading state
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  fetchData,
  searchKey,
  filters = [],
  bulkActions,
  entityName = 'item',
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[] | null>(initialData)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch data if fetchData is provided
  useEffect(() => {
    if (fetchData) {
      const loadData = async () => {
        try {
          const fetchedData = await fetchData()
          setData(fetchedData)
          setError(null)
        } catch (err) {
          setError('Failed to fetch data')
          setData([])
        }
      }
      loadData()
    }
  }, [fetchData])

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      columnVisibility,
      sorting,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  if (isLoading || (fetchData && !data)) {
    return <Loader />
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={`Search ${entityName}s...`}
        filters={filters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className ?? ''
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {bulkActions && (
        <DataTableBulkActions table={table} entityName={entityName}>
          {bulkActions}
        </DataTableBulkActions>
      )}
    </div>
  )
}