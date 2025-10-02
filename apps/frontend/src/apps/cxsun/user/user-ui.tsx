import * as React from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { UserDialog } from "./user-dialog";
import { schema } from "./user-data";
import { useDataTableLogic } from "./user-logic";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import {DataTableBulkActions} from "@/resources/components/data-table";

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

    return (
        <div className="w-full flex flex-col gap-6 px-4 lg:px-6">
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
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        table.options.meta?.deleteData(
                            table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
                        );
                        table.resetRowSelection();
                    }}
                >
                    Delete Selected
                </Button>
            </DataTableBulkActions>
        </div>
    );
}