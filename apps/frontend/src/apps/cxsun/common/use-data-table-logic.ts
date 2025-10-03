// File: hooks/use-data-table-logic.ts
// Description: Generic hook for table logic including DnD, Tanstack Table, and CRUD meta.
// Notes for study:
// - Parametrized with <T> for reusability across data types.
// - Handles data state, sorting, filtering, etc.
// - Meta provides generic CRUD with toasts.
// - Fixed by adding all missing definitions, imports, and states.

import * as React from "react";
import { toast } from "sonner";
import {
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";

export type TableMeta<T> = {
    addData: (newItem: Omit<T, "id" | "created_at">) => void;
    updateData: (id: number, updatedItem: Omit<T, "id" | "created_at">) => void;
    deleteData: (ids: number[]) => void;
};

export function useDataTableLogic<T extends { id: number; created_at: string }>(initialData: T[], columns: ColumnDef<T>[]) {
    const [data, setData] = React.useState(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const sortableId = React.useId();
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        meta: {
            addData: (newItem) => {
                const newId = Math.max(...data.map((d) => d.id), 0) + 1;
                setData([...data, { ...newItem, id: newId, created_at: new Date().toISOString() } as T]);
                toast.success("Item added");
            },
            updateData: (id, updatedItem) => {
                setData((prev) => prev.map((item) => item.id === id ? { ...item, ...updatedItem } : item));
                toast.success("Item updated");
            },
            deleteData: (ids) => {
                setData((prev) => prev.filter((item) => !ids.includes(item.id)));
                toast.success(`Deleted ${ids.length} items`);
            },
        },
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                return arrayMove(data, oldIndex, newIndex);
            });
        }
    }

    return { table, data, setData, sensors, sortableId, dataIds, handleDragEnd };
}