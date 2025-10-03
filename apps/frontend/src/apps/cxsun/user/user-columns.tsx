// File: user-columns.tsx
// Description: Column definitions for the user table.
// Notes for study:
// - These are specific to users but follow a pattern that can be replicated for other entities.
// - Completed with all columns from original, including Badge for role.

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
import { DataTableColumnHeader } from "@/apps/cxsun/common/column-header"; // Reusable header.
import { type User } from "./user-schema";
import { useDataContext } from "@/apps/cxsun/common/data-provider";

export const columns: ColumnDef<User>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => (
            <Button variant="ghost" size="icon" className="text-muted-foreground size-7 hover:bg-transparent">
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
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
            const { setOpen, setCurrentRow } = useDataContext<User>();
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
                            className="text-destructive focus:text-destructive"
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