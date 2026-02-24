// resources/js/components/table/ListLayout.tsx
'use client';

import type { ReactNode } from 'react';
import ListHeader from './ListHeader';

interface ListLayoutProps {
    title: string;
    description?: string;
    createRoute?: string;
    onCreate?: () => void;
    createLabel?: string;
    children: ReactNode;
}

export default function ListLayout({
    title,
    description,
    createRoute,
    onCreate,
    createLabel,
    children,
}: ListLayoutProps) {
    return (
        <div className="space-y-6 p-6">
            <ListHeader
                title={title}
                description={description}
                createRoute={createRoute}
                onCreate={onCreate}
                createLabel={createLabel}
            />
            {children}
        </div>
    );
}
