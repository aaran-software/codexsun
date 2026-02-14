'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableColumnsToggle from '@/components/table/TableColumnsToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as tenantRoutes } from '@/routes/admin/tenants/index';
import type { BreadcrumbItem } from '@/types';

export default function Index() {
    const props = usePage().props as any;
    const tenants = props.tenants;
    const filters = props.filters ?? {};

    const route = useRoute();

    /* ------------------------------------------------------------
     | Filters
     ------------------------------------------------------------ */

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        per_page: filters.per_page || '25',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            status: filters.status || 'all',
            per_page: filters.per_page || '25',
        });
    }, [filters]);

    const buildPayload = useCallback(() => {
        return {
            search: localFilters.search || undefined,
            status:
                localFilters.status === 'all' ? undefined : localFilters.status,
            per_page: localFilters.per_page,
        };
    }, [localFilters]);

    const navigate = useCallback(
        (extra: Record<string, any> = {}, resetPage = true) => {
            setIsNavigating(true);

            router.get(
                route('admin.tenants.index'),
                {
                    ...buildPayload(),
                    ...(resetPage ? { page: 1 } : {}),
                    ...extra,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onFinish: () => setIsNavigating(false),
                },
            );
        },
        [route, buildPayload],
    );

    const handleReset = () => {
        router.get(route('admin.tenants.index'), {}, { replace: true });
    };

    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({
            ...prev,
            per_page: String(perPage),
        }));
        navigate({ per_page: perPage }, true);
    };

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate({}, true);
        }, 500);
        return () => clearTimeout(timeout);
    }, [localFilters.search]);

    /* ------------------------------------------------------------
     | Column Toggle
     ------------------------------------------------------------ */

    const columnConfig = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'domain', label: 'Domain' },
        { key: 'industry', label: 'Industry' },
        { key: 'status', label: 'Status' },
    ];

    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        columnConfig.map((col) => col.key),
    );

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key)
                ? prev.filter((col) => col !== key)
                : [...prev, key],
        );
    };

    // Persist column visibility
    useEffect(() => {
        const saved = localStorage.getItem('tenant_columns');
        if (saved) setVisibleColumns(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('tenant_columns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    /* ------------------------------------------------------------
     | Active Filter Badges
     ------------------------------------------------------------ */

    const activeBadges = useMemo(() => {
        const items = [];

        if (localFilters.search) {
            items.push(
                <Badge key="search" variant="secondary" className="gap-1">
                    Search: {localFilters.search}
                    <button
                        onClick={() =>
                            setLocalFilters((p) => ({ ...p, search: '' }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.status !== 'all') {
            items.push(
                <Badge key="status" variant="secondary" className="gap-1">
                    Status: {localFilters.status}
                    <button
                        onClick={() =>
                            setLocalFilters((p) => ({
                                ...p,
                                status: 'all',
                            }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        return items.length ? items : null;
    }, [localFilters]);

    /* ------------------------------------------------------------
     | Breadcrumbs
     ------------------------------------------------------------ */

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenants', href: tenantRoutes().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenants" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tenants</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage tenant accounts
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={route('admin.tenants.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Tenant
                        </Link>
                    </Button>
                </div>

                {/* Filters */}

                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search name, slug, domain..."
                                value={localFilters.search}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <Select
                            value={localFilters.status}
                            onValueChange={(v: any) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    status: v,
                                }));
                                navigate({ status: v });
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div>
                        <TableColumnsToggle
                            columns={columnConfig}
                            visibleColumns={visibleColumns}
                            onToggle={toggleColumn}
                        />
                    </div>
                </div>

                {/* Active Filters */}
                {activeBadges && (
                    <div className="flex gap-2 rounded-md border bg-muted/30 p-3">
                        {activeBadges}
                    </div>
                )}

                {/* Table */}
                <DataTable
                    data={tenants.data}
                    pagination={tenants}
                    perPage={parseInt(localFilters.per_page)}
                    onPerPageChange={handlePerPageChange}
                    onPageChange={(page) => navigate({ page }, false)}
                    emptyMessage="No tenants found."
                    isLoading={isNavigating}
                >
                    <TableHeader>
                        <TableRow className="border-b bg-muted font-semibold">
                            {visibleColumns.includes('name') && (
                                <TableHead>Name</TableHead>
                            )}
                            {visibleColumns.includes('slug') && (
                                <TableHead>Slug</TableHead>
                            )}
                            {visibleColumns.includes('domain') && (
                                <TableHead>Domain</TableHead>
                            )}
                            {visibleColumns.includes('industry') && (
                                <TableHead>Industry</TableHead>
                            )}
                            {visibleColumns.includes('status') && (
                                <TableHead>Status</TableHead>
                            )}
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {tenants.data.map((tenant: any) => (
                            <TableRow key={tenant.id}>
                                {visibleColumns.includes('name') && (
                                    <TableCell className="font-medium">
                                        {tenant.name}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('slug') && (
                                    <TableCell>{tenant.slug}</TableCell>
                                )}

                                {visibleColumns.includes('domain') && (
                                    <TableCell>
                                        {tenant.domain || '—'}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('industry') && (
                                    <TableCell>
                                        {tenant.industry || '—'}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('status') && (
                                    <TableCell>
                                        <Badge
                                            className={
                                                tenant.is_active
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                            }
                                        >
                                            {tenant.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                )}

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={route(
                                                        'admin.tenants.edit',
                                                        tenant.id,
                                                    )}
                                                >
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem>
                                                {tenant.is_active
                                                    ? 'Suspend'
                                                    : 'Activate'}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem className="text-red-600">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </DataTable>
            </div>
        </AppLayout>
    );
}
