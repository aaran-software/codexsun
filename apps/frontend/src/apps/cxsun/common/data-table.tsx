// File: components/data-table.tsx
// Description: Generic reusable DataTable component.
// Notes for study:
// - Accepts generic props for data, schema, columns, etc.
// - Integrates DnD, toolbar, pagination, bulk actions.
// - Can be used in any module by passing entity-specific props.
// - Exposes meta globally if needed.

import * as React from "react";
import {z} from "zod";
import {ColumnDef} from "@tanstack/react-table";
import {useDataTableLogic} from "@/apps/cxsun/common/use-data-table-logic";
import {DataTableToolbar} from "@/apps/cxsun/common/toolbar";
import {DndContext} from "@dnd-kit/core";
import {TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {Table} from "lucide-react";
import { SortableContext } from "@dnd-kit/sortable";
import {DataTablePagination} from "@/apps/cxsun/common/pagination";
import {DataTableBulkActions} from "@/apps/cxsun/common/bulk-actions";
// ... imports ...

type DataTableProps<T> = {
    initialData: T[];
    schema: z.ZodSchema<T>;
    columns: ColumnDef<T>[];
    primaryButtons: React.ReactNode;
    dialogs: React.ReactNode;
    searchPlaceholder: string;
    searchKey: string;
    filters: Array<{ columnId: string; title: string; options: { label: string; value: string }[] }>;
};

export function DataTable<T extends { id: number }>({ initialData, columns, primaryButtons, dialogs, searchPlaceholder, searchKey, filters }: DataTableProps<T>) {
    const { table} = useDataTableLogic<T>(initialData);

    React.useEffect(() => {
        (window as any).tableMeta = table.options.meta; // Global exposure.
    }, [table]);

    return (
        <div className="w-full flex flex-col gap-6 px-4 lg:px-6">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Today's date and time is 06:53 PM IST on Thursday, October 02, 2025</div>
                {primaryButtons}
            </div>
            <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} searchKey={searchKey} filters={filters} />
            <div className="overflow-hidden rounded-lg border">
                <DndContext /* ... */ >
                    <Table>
                        <TableHeader /* ... */ >
                            {/* Render headers */}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                <SortableContext /* ... */ >
                                    {table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} />
                                    ))}
                                </SortableContext>
                            ) : (
                                <TableRow><TableCell colSpan={columns.length}>No results.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
            <DataTablePagination table={table} />
            <DataTableBulkActions table={table} entityName="item">
                <button /* delete selected */ onClick={() => {
                    table.options.meta?.deleteData(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
                    table.resetRowSelection();
                }}>
                    Delete Selected
                </button>
            </DataTableBulkActions>
            {dialogs}
        </div>
    );
}

// DraggableRow component (reusable).
function DraggableRow<T>({ row }: { row: Row<T> }) {
    // ... same as before ...
}