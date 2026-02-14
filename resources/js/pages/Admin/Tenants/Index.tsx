'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRoute } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const filters = props.filters ?? {};

    const route = useRoute();

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

    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({
            ...prev,
            per_page: String(perPage),
        }));
        navigate({ per_page: perPage }, true);
    };

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
                            Manage all tenant accounts
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
                <div className="flex flex-wrap items-center gap-4">
                    <Input
                        placeholder="Search by name, slug or domain..."
                        value={localFilters.search}
                        onChange={(e) =>
                            setLocalFilters((prev) => ({
                                ...prev,
                                search: e.target.value,
                            }))
                        }
                        onKeyUp={(e) => e.key === 'Enter' && navigate()}
                        className="max-w-sm"
                        disabled={isNavigating}
                    />

                    <Select
                        value={localFilters.status}
                        onValueChange={(v: any) => {
                            setLocalFilters((prev) => ({
                                ...prev,
                                status: v,
                            }));
                            navigate({ status: v });
                        }}
                        disabled={isNavigating}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={() => navigate()}
                        disabled={isNavigating}
                    >
                        Search
                    </Button>
                </div>

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
                        <TableRow className="bg-muted font-semibold">
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {tenants.data.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-medium">
                                    {tenant.name}
                                </TableCell>
                                <TableCell>{tenant.slug}</TableCell>
                                <TableCell>{tenant.domain || '—'}</TableCell>
                                <TableCell>{tenant.industry || '—'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            tenant.is_active
                                                ? 'default'
                                                : 'destructive'
                                        }
                                    >
                                        {tenant.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={route(
                                            'admin.tenants.edit',
                                            tenant.id,
                                        )}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </DataTable>
            </div>
        </AppLayout>
    );
}
