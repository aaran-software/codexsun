// resources/js/components/table/ListToolbar.tsx
'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TableColumnsToggle from './TableColumnsToggle';

type Column = { key: string; label: string };

interface ListToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    onRefresh: () => void;
    columnConfig: Column[];
    visibleColumns: string[];
    onToggleColumn: (key: string) => void;
    placeholder?: string;
    statusOptions?: Array<{ value: string; label: string }>;
}

const defaultStatusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'deleted', label: 'Trash' },
];

export default function ListToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onRefresh,
    columnConfig,
    visibleColumns,
    onToggleColumn,
    placeholder = 'Search key, name...',
    statusOptions = defaultStatusOptions,
}: ListToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={onRefresh}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            <TableColumnsToggle
                columns={columnConfig}
                visibleColumns={visibleColumns}
                onToggle={onToggleColumn}
            />
        </div>
    );
}
