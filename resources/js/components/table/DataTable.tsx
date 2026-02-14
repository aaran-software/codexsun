'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface DataTableProps {
    data: any[];
    pagination: PaginationMeta;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    onPageChange: (page: number) => void;
    emptyMessage?: string;
    isLoading?: boolean;
    children: ReactNode;
}

export default function DataTable({
    data,
    pagination,
    perPage,
    onPerPageChange,
    onPageChange,
    emptyMessage = 'No records found.',
    isLoading = false,
    children,
}: DataTableProps) {
    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="relative rounded-md border">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}

                <Table>{children}</Table>

                {!isLoading && data.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Info */}
                <div className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium">{pagination.from ?? 0}</span>{' '}
                    to <span className="font-medium">{pagination.to ?? 0}</span>{' '}
                    of <span className="font-medium">{pagination.total}</span>{' '}
                    results
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {/* Per Page */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Rows per page
                        </span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(v) => onPerPageChange(parseInt(v))}
                        >
                            <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                onPageChange(pagination.current_page - 1)
                            }
                        >
                            Previous
                        </Button>

                        <span className="text-sm">
                            Page{' '}
                            <span className="font-medium">
                                {pagination.current_page}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {pagination.last_page}
                            </span>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                onPageChange(pagination.current_page + 1)
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
