// resources/js/components/table/ListActiveFilters.tsx
'use client';

import type { ReactNode } from 'react';

interface ListActiveFiltersProps {
    children: ReactNode;
}

export default function ListActiveFilters({
    children,
}: ListActiveFiltersProps) {
    return (
        <div className="flex gap-2 rounded-md border bg-muted/30 p-3">
            {children}
        </div>
    );
}
