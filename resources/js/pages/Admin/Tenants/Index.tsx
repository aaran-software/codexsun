'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { MoreHorizontal, RotateCcw, Search, X } from 'lucide-react';
import { useMemo } from 'react';
import { useRoute } from 'ziggy-js';

import CrudTable from '@/components/table/CrudTable';
import ListLayout from '@/components/table/ListLayout';
import TableColumnsToggle from '@/components/table/TableColumnsToggle';
import { useColumnVisibility } from '@/components/table/useColumnVisibility';
import { useCrudFilters } from '@/components/table/useCrudFilters';

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

export default function List() {
    const props = usePage().props as any;
    const tenants = props.tenants;
    const serverFilters = props.filters ?? {};
    const route = useRoute();

    /* ------------------------------------------------------------------
     | CRUD Filters Hook
     ------------------------------------------------------------------ */

    const { filters, setFilters, navigate, isNavigating } =
        useCrudFilters({
            initialFilters: {
                search: serverFilters.search || '',
                status: serverFilters.status || 'all',
                per_page: serverFilters.per_page || '25',
            },
            routeName: 'admin.tenants.index',
            debounceKeys: ['search'],
        });

    /* ------------------------------------------------------------------
     | Column Visibility Hook
     ------------------------------------------------------------------ */

    const columnConfig = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'domain', label: 'Domain' },
        { key: 'industry', label: 'Industry' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } =
        useColumnVisibility(
            'tenant_columns',
            columnConfig.map((col) => col.key),
        );

    /* ------------------------------------------------------------------
     | Active Filter Badges
     ------------------------------------------------------------------ */

    const activeBadges = useMemo(() => {
        const items = [];

        if (filters.search) {
            items.push(
                <Badge key="search" variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button
                        onClick={() =>
                            setFilters((p: any) => ({
                                ...p,
                                search: '',
                            }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (filters.status !== 'all') {
            items.push(
                <Badge key="status" variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <button
                        onClick={() =>
                            setFilters((p: any) => ({
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
    }, [filters]);

    /* ------------------------------------------------------------------
     | Breadcrumbs
     ------------------------------------------------------------------ */

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenants', href: tenantRoutes().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenants" />

            <ListLayout
                title="Tenants"
                description="Manage tenant accounts"
                createRoute={route('admin.tenants.create')}
            >
                {/* ------------------------------------------------------------
                 | Filters Section
                 ------------------------------------------------------------ */}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search name, slug, domain..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((p: any) => ({
                                        ...p,
                                        search: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <Select
                            value={filters.status}
                            onValueChange={(v: any) => {
                                setFilters((p: any) => ({
                                    ...p,
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
                            onClick={() => navigate({}, true)}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <TableColumnsToggle
                        columns={columnConfig}
                        visibleColumns={visibleColumns}
                        onToggle={toggleColumn}
                    />
                </div>

                {/* Active Filters */}
                {activeBadges && (
                    <div className="flex gap-2 rounded-md border bg-muted/30 p-3">
                        {activeBadges}
                    </div>
                )}

                {/* ------------------------------------------------------------
                 | CRUD TABLE
                 ------------------------------------------------------------ */}

                <CrudTable
                    data={tenants.data}
                    pagination={tenants}
                    perPage={parseInt(filters.per_page)}
                    onPerPageChange={(perPage) =>
                        navigate({ per_page: perPage }, true)
                    }
                    onPageChange={(page) => navigate({ page }, false)}
                    isLoading={isNavigating}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
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
                </CrudTable>
            </ListLayout>
        </AppLayout>
    );
}
