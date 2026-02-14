'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface TablePaginationProps {
    pagination: PaginationMeta;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    onPageChange: (page: number) => void;
}

export default function TablePagination({
    pagination,
    perPage,
    onPerPageChange,
    onPageChange,
}: TablePaginationProps) {
    const { current_page, last_page, from, to, total } = pagination;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Results Info */}
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{from ?? 0}</span> to{' '}
                <span className="font-medium">{to ?? 0}</span> of{' '}
                <span className="font-medium">{total}</span> results
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
                        onValueChange={(value) =>
                            onPerPageChange(Number(value))
                        }
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
                        disabled={current_page === 1}
                        onClick={() => onPageChange(current_page - 1)}
                    >
                        Previous
                    </Button>

                    <span className="text-sm">
                        Page <span className="font-medium">{current_page}</span>{' '}
                        of <span className="font-medium">{last_page}</span>
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={current_page === last_page}
                        onClick={() => onPageChange(current_page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
