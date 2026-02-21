'use client';

import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ListLayoutProps {
    title: string;
    description?: string;
    createRoute?: string;
    children: ReactNode;
}

export default function ListLayout({
    title,
    description,
    createRoute,
    children,
}: ListLayoutProps) {
    return (
        <div className="space-y-6 p-6">
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

                {createRoute && (
                    <Button asChild>
                        <Link href={createRoute}>
                            <Plus className="mr-2 h-4 w-4 bg-primary" />
                            Create
                        </Link>
                    </Button>
                )}
            </div>

            {children}
        </div>
    );
}
