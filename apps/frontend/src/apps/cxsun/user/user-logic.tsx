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
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
import { schema } from "./user-data";
import { DataTableColumnHeader } from "./to/column-header";
import { useUsers } from "./users-provider";

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => (
            <Button
                {...useSortable({ id: row.original.id }).attributes}
                {...useSortable({ id: row.original.id }).listeners}
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-7 hover:bg-transparent"
            >
                <IconGripVertical className="text-muted-foreground size-3" />
                <span className="sr-only">Drag to reorder</span>
            </Button>
        ),
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "username",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
        cell: ({ row }) => <div>{row.original.username}</div>,
        enableHiding: false,
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.role}
                </Badge>
            </div>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "tenant_id",
        header: () => <div className="w-full text-right">Tenant ID</div>,
        cell: ({ row }) => <div className="text-right">{row.original.tenant_id}</div>,
    },
    {
        accessorKey: "created_at",
        header: () => <div className="w-full text-right">Created At</div>,
        cell: ({ row }) => <div className="text-right">{new Date(row.original.created_at).toLocaleDateString()}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { setOpen, setCurrentRow } = useUsers();
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                            onSelect={() => {
                                setCurrentRow(row.original);
                                setOpen("edit");
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Make a copy</DropdownMenuItem>
                        <DropdownMenuItem>Favorite</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                                setCurrentRow(row.original);
                                setOpen("delete");
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function useDataTableLogic(initialData: z.infer<typeof schema>[]) {
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
            addData: (newItem: Omit<z.infer<typeof schema>, "id" | "created_at">) => {
                const newId = Math.max(...data.map((d) => d.id), 0) + 1;
                setData([...data, { id: newId, created_at: new Date().toISOString(), ...newItem }]);
                toast.success("User added successfully");
            },
            updateData: (id: number, updatedItem: Omit<z.infer<typeof schema>, "id" | "created_at">) => {
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