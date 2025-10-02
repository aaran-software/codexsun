import * as React from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { z } from "zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import { schema } from "./user-data";
import { useDataTableLogic } from "./user-logic";
import { DataTableToolbar } from "./to/toolbar";
import { DataTablePagination } from "./to/pagination";
import { DataTableBulkActions } from "./to/bulk-actions";
import { UsersPrimaryButtons } from "./user-primary-buttons";
import { UsersDialog } from "./user-dialog";
import { UsersProvider } from "./users-provider";

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
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

export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
    const { table, data, setData, sensors, sortableId, dataIds, handleDragEnd } = useDataTableLogic(initialData);

    // Store table meta globally for dialog access
    React.useEffect(() => {
        (window as any).tableMeta = {
            addData: table.options.meta?.addData,
            updateData: table.options.meta?.updateData,
            deleteData: table.options.meta?.deleteData,
        };
    }, [table]);

    return (
        <UsersProvider>
            <div className="w-full flex flex-col gap-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Today's date and time is 06:53 PM IST on Thursday, October 02, 2025
                    </div>
                    <UsersPrimaryButtons />
                </div>
                <DataTableToolbar
                    table={table}
                    searchPlaceholder="Filter usernames..."
                    searchKey="username"
                    filters={[
                        {
                            columnId: "role",
                            title: "Role",
                            options: [
                                { label: "Admin", value: "Admin" },
                                { label: "Editor", value: "Editor" },
                                { label: "Viewer", value: "Viewer" },
                            ],
                        },
                    ]}
                />
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
                                    <TableRow>
                                        <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <DataTablePagination table={table} />
                <DataTableBulkActions
                    table={table}
                    entityName="user"
                >
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2"
                        onClick={() => {
                            table.options.meta?.deleteData(
                                table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
                            );
                            table.resetRowSelection();
                        }}
                    >
                        Delete Selected
                    </button>
                </DataTableBulkActions>
                <UsersDialog />
            </div>
        </UsersProvider>
    );
}