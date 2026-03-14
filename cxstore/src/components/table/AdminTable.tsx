import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Column<TItem> {
  header: string
  render: (item: TItem) => ReactNode
  className?: string
}

interface AdminTableProps<TItem> {
  columns: Column<TItem>[]
  items: TItem[]
  emptyMessage: string
}

export function AdminTable<TItem>({ columns, items, emptyMessage }: AdminTableProps<TItem>) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={cn("px-4 py-3 text-left font-medium text-foreground", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {items.length > 0 ? items.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.header} className={cn("px-4 py-3 align-top text-muted-foreground", column.className)}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
