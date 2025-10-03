// File: hooks/use-data-table-logic.ts
// Description: Generic hook for table logic including DnD, Tanstack Table, and CRUD meta.
// Notes for study:
// - Parametrized with <T> for reusability across data types.
// - Handles data state, sorting, filtering, etc.
// - Meta provides generic CRUD with toasts.

import * as React from "react";
import { toast } from "sonner";
// ... other imports from dnd-kit, tanstack ...

export type TableMeta<T> = {
    addData: (newItem: Omit<T, "id" | "created_at">) => void;
    updateData: (id: number, updatedItem: Omit<T, "id" | "created_at">) => void;
    deleteData: (ids: number[]) => void;
};

export function useDataTableLogic<T extends { id: number; created_at: string }>(initialData: T[]) {
    const [data, setData] = React.useState(() => initialData);
    // ... states for rowSelection, columnVisibility, etc. ...

    const table = useReactTable({
        data,
        // columns would be passed as prop in usage.
        // ... other configs ...
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

    // ... handleDragEnd ...

    return { table, data, setData, sensors, sortableId, dataIds, handleDragEnd };
}