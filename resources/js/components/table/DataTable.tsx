'use client';

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import TablePagination from './TablePagination';
import { Table } from '@/components/ui/table';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface DataTableProps {
    data: unknown[];
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
            {/* Table Wrapper */}
            <div className="rounded-lg border border-neutral-200 p-0.5">
                <div className="relative overflow-hidden rounded-md border border-neutral-200">
                    {/*{isLoading && (*/}
                    {/*    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">*/}
                    {/*        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    <Table>{children}</Table>

                    {!isLoading && data.length === 0 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <TablePagination
                pagination={pagination}
                perPage={perPage}
                onPerPageChange={onPerPageChange}
                onPageChange={onPageChange}
            />
        </div>
    );
}
