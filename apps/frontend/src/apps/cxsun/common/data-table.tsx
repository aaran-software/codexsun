// File: components/data-table.tsx
// Description: Generic reusable DataTable component.
// Notes for study:
// - Accepts generic props for data, schema, columns, etc.
// - Integrates DnD, toolbar, pagination, bulk actions.
// - Can be used in any module by passing entity-specific props.
// - Exposes meta globally if needed.
// - Fixed by completing DndContext and SortableContext props.
// - Corrected import for Table from ui/table, not lucide-react.
// - Added DraggableRow definition.
// - Added missing imports for Row, flexRender.

import * as React from "react";
import { z } from "zod";
import { ColumnDef, Row, flexRender } from "@tanstack/react-table";
import { useDataTableLogic } from "./use-data-table-logic";
import { DataTableToolbar } from "./toolbar";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "./pagination";
import { DataTableBulkActions } from "./bulk-actions";

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
    const { table, data, setData, sensors, sortableId, dataIds, handleDragEnd } = useDataTableLogic<T>(initialData, columns);

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
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    id={sortableId}
                >
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
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
                <button onClick={() => {
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
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{ transform: CSS.Transform.toString(transform), transition }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
        </TableRow>
    );
}