// File: user-provider.tsx
// Description: User-specific provider with context and table logic.
// Notes for study:
// - Fixed by removing call to useDataTableLogic in provider component to avoid error.
// - useDataTableLogic is exported for use in user-table.tsx.
// - Context only for dialog state; tableMeta via window as original.

import * as React from "react";
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
import { toast } from "sonner";
import { type User } from "./user-schema";
import { columns } from "./user-columns"; // Import user-specific columns.

type DialogType = 'invite' | 'add' | 'edit' | 'delete' | null;

type TableMeta = {
    addData: (newItem: Omit<User, "id" | "created_at">) => void;
    updateData: (id: number, updatedItem: Omit<User, "id" | "created_at">) => void;
    deleteData: (ids: number[]) => void;
};

type UsersContextType = {
    open: DialogType;
    setOpen: (str: DialogType) => void;
    currentRow: User | null;
    setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
};

const UsersContext = React.createContext<UsersContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState<DialogType>(null);
    const [currentRow, setCurrentRow] = React.useState<User | null>(null);

    return (
        <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </UsersContext.Provider>
    );
}

export const useUsers = () => {
    const context = React.useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within UserProvider');
    }
    return context;
};

export function useDataTableLogic(initialData: User[]) {
    const [data, setData] = React.useState(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const sortableId = React.useId();
    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

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
            addData: (newItem: Omit<User, "id" | "created_at">) => {
                const newId = Math.max(...data.map((d) => d.id), 0) + 1;
                setData([...data, { id: newId, created_at: new Date().toISOString(), ...newItem }]);
                toast.success("User added successfully");
            },
            updateData: (id: number, updatedItem: Omit<User, "id" | "created_at">) => {
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, ...updatedItem } : item
                    )
                );
                toast.success("User updated successfully");
            },
            deleteData: (ids: number[]) => {
                setData((prev) => prev.filter((item) => !ids.includes(item.id)));
                toast.success(`Deleted ${ids.length} user${ids.length > 1 ? "s" : ""} successfully`);
            },
        } as TableMeta,
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