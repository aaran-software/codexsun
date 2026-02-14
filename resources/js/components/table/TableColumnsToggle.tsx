'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnConfig {
    key: string;
    label: string;
}

interface TableColumnsToggleProps {
    columns: ColumnConfig[];
    visibleColumns: string[];
    onToggle: (key: string) => void;
}

export default function TableColumnsToggle({
    columns,
    visibleColumns,
    onToggle,
}: TableColumnsToggleProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Columns
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={visibleColumns.includes(column.key)}
                        onCheckedChange={() => onToggle(column.key)}
                    >
                        {column.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
