// resources/js/components/table/ListHeader.tsx
'use client';

import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListHeaderProps {
    title: string;
    description?: string;
    createRoute?: string;
    onCreate?: () => void;
    createLabel?: string;
}

export default function ListHeader({
                                       title,
                                       description,
                                       createRoute,
                                       onCreate,
                                       createLabel = 'Create',
                                   }: ListHeaderProps) {
    const hasCreate = !!createRoute || !!onCreate;

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-black/60">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm font-semibold text-black/30">
                        {description}
                    </p>
                )}
            </div>

            {hasCreate && (
                <Button
                    asChild={!!createRoute}
                    onClick={onCreate}
                >
                    {createRoute ? (
                        <Link href={createRoute}>
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </Link>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
