'use client';

import type { ReactNode } from 'react';
import DataTable from '@/components/table/DataTable';

interface ColumnConfig {
    key: string;
    label: string;
}

interface CrudTableProps {
    data: any[];
    pagination: any;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    columnConfig: ColumnConfig[];
    visibleColumns: string[];
    toggleColumn: (key: string) => void;
    children: ReactNode;
}

export default function CrudTable({
    data,
    pagination,
    perPage,
    onPerPageChange,
    onPageChange,
    isLoading,
    children,
}: CrudTableProps) {
    return (
        <div className="space-y-4">
            <DataTable
                data={data}
                pagination={pagination}
                perPage={perPage}
                onPerPageChange={onPerPageChange}
                onPageChange={onPageChange}
                isLoading={isLoading}
            >
                {children}
            </DataTable>
        </div>
    );
}
