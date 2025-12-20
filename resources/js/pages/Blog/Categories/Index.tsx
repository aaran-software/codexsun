// resources/js/Pages/Blog/Categories/Index.tsx (Ultimate Stable Version - No More Crashes)

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BreadcrumbItem } from '@/types';
import { Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    active_id: number;
    deleted_at: string | null;
    posts_count?: number;
}

// Laravel Paginator shape
interface Pagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface BlogCategoriesPageProps {
    categories?: Pagination<BlogCategory>; // Optional to handle missing prop
    filters?: {
        search?: string;
        active_filter?: 'all' | 'active' | 'inactive';
        per_page?: string;
    };
    can?: { create: boolean; delete: boolean };
    trashedCount?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Blog', href: route('blog.categories.index') },
    { title: 'Categories', href: route('blog.categories.index') },
];

export default function Index() {
    const pageProps = usePage<BlogCategoriesPageProps>().props;

    // Ultimate safe defaults - guarantees pagination object always exists
    const safePagination: Pagination<BlogCategory> = {
        data: pageProps.categories?.data ?? [],
        current_page: pageProps.categories?.current_page ?? 1,
        last_page: pageProps.categories?.last_page ?? 1,
        from: pageProps.categories?.from ?? null,
        to: pageProps.categories?.to ?? null,
        total: pageProps.categories?.total ?? 0,
        per_page: pageProps.categories?.per_page ?? 50,
    };

    const categories = safePagination.data;

    const filters = pageProps.filters ?? {};
    const can = pageProps.can ?? { create: false, delete: false };
    const trashedCount = pageProps.trashedCount ?? 0;

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        active_filter: filters.active_filter ?? 'all',
        per_page: filters.per_page ?? '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setLocalFilters({
            search: filters.search ?? '',
            active_filter: filters.active_filter ?? 'all',
            per_page: filters.per_page ?? '50',
        });
    }, [filters]);

    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            active_filter:
                localFilters.active_filter === 'all'
                    ? undefined
                    : localFilters.active_filter,
            per_page: localFilters.per_page,
        }),
        [localFilters],
    );

    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('blog.categories.index'),
                { ...buildPayload(), ...extra },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsNavigating(false),
                },
            );
        },
        [buildPayload],
    );

    const handleReset = () => {
        router.get(
            route('blog.categories.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    const clearFilter = useCallback(
        (key: 'search' | 'active_filter') => {
            const updates: Partial<typeof localFilters> = {};

            if (key === 'search') updates.search = '';
            if (key === 'active_filter') updates.active_filter = 'all';

            setLocalFilters((prev) => ({ ...prev, ...updates }));
            navigate(updates);
        },
        [navigate],
    );


    const activeFilterBadges = useMemo(() => {
        const badges: JSX.Element[] = [];

        if (localFilters.search) {
            badges.push(
                <Badge
                    key="search"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Search: "{localFilters.search}"
                    <button
                        onClick={() => clearFilter('search')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.active_filter !== 'all') {
            badges.push(
                <Badge
                    key="active"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Status:{' '}
                    {localFilters.active_filter === 'active'
                        ? 'Active'
                        : 'Inactive'}
                    <button
                        onClick={() => clearFilter('active_filter')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        return badges;
    }, [localFilters.search, localFilters.active_filter, clearFilter]);

    return (
        <AppLayout title="Blog Categories" breadcrumb={breadcrumbs}>
            <Head title="Blog Categories" />

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg sm:text-2xl font-bold">Blog Categories</h1>

                        <div className="flex items-center gap-3">
                            {trashedCount > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="destructive">
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                {trashedCount} in trash
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Deleted categories</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {can.create && (
                                <Link href={route('blog.categories.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Category
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Filters */}
                    <div className="flex flex-col items-end gap-4 sm:flex-row">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or slug..."
                                value={localFilters.search}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate({ search: localFilters.search });
                                    }
                                }}

                                className="pl-10"
                            />
                        </div>

                        <select
                            value={localFilters.active_filter}
                            onChange={(e) => {
                                const value = e.target.value as 'all' | 'active' | 'inactive';

                                setLocalFilters((prev) => ({
                                    ...prev,
                                    active_filter: value,
                                }));

                                navigate({ active_filter: value });
                            }}
                            className={"bg-background text-foreground"}
                        >

                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        <select
                            value={localFilters.per_page}
                            onChange={(e) => {
                                const value = e.target.value;

                                setLocalFilters((prev) => ({
                                    ...prev,
                                    per_page: value,
                                }));

                                navigate({ per_page: value });
                            }}

                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-32"
                        >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate({
                                        search: localFilters.search,
                                        active_filter:
                                            localFilters.active_filter === 'all'
                                                ? undefined
                                                : localFilters.active_filter,
                                        per_page: localFilters.per_page,
                                    })
                                }
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Apply
                            </Button>

                            {(localFilters.search ||
                                localFilters.active_filter !== 'all') && (
                                <Button variant="ghost" onClick={handleReset}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filter Badges */}
                    {activeFilterBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeFilterBadges}
                        </div>
                    )}

                    {/* Data Table - Guaranteed valid pagination object */}
                    <DataTable
                        data={safePagination.data}
                        pagination={safePagination}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No categories found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold">
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-center">
                                    Posts
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow
                                    key={category.id}
                                    className={
                                        category.deleted_at ? 'opacity-60' : ''
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {category.deleted_at ? (
                                            <span className="text-muted-foreground">
                                                {category.name}
                                            </span>
                                        ) : (
                                            <Link
                                                href={route(
                                                    'blog.categories.edit',
                                                    category.id,
                                                )}
                                                className="hover:text-primary hover:underline"
                                            >
                                                {category.name}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {category.slug}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                category.active_id === 1
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                category.active_id === 1
                                                    ? 'bg-green-500 text-white'
                                                    : ''
                                            }
                                        >
                                            {category.active_id === 1
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {category.posts_count ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={category.id}
                                            editRoute={route(
                                                'blog.categories.edit',
                                                category.id,
                                            )}
                                            deleteRoute={route(
                                                'blog.categories.destroy',
                                                category.id,
                                            )}
                                            restoreRoute={
                                                category.deleted_at
                                                    ? route(
                                                          'blog.categories.restore',
                                                          category.id,
                                                      )
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                category.deleted_at
                                                    ? route(
                                                          'blog.categories.forceDelete',
                                                          category.id,
                                                      )
                                                    : undefined
                                            }
                                            isDeleted={!!category.deleted_at}
                                            canDelete={can.delete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            </div>
        </AppLayout>
    );
}
