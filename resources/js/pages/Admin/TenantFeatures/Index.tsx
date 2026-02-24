// resources/js/pages/Admin/TenantFeatures/Index.tsx
'use client';

import { Head, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import CrudTable from '@/components/table/CrudTable';
import ListActiveFilters from '@/components/table/ListActiveFilters';
import ListLayout from '@/components/table/ListLayoutNew';
import ListToolbar from '@/components/table/ListToolbar';
import { useColumnVisibility } from '@/components/table/useColumnVisibility';
import { useCrudFilters } from '@/components/table/useCrudFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type TenantFeature = {
    id: number;
    tenant_id: number;
    feature_id: number;
    tenant?: { id: number; name: string; slug?: string };
    feature?: { id: number; key: string; name: string };
    expires_at: string | null;
    limit: number | null;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
};

export default function TenantFeaturesIndex() {
    const pageProps = usePage().props as any;
    const tenantFeatures = pageProps.tenant_features;
    const tenants = pageProps.tenants || [];
    const features = pageProps.features || [];
    const serverFilters = pageProps.filters ?? {};
    const route = useRoute();

    // ─────────────────────────────────────────────────────────
    // Filters
    // ─────────────────────────────────────────────────────────

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters.search || '',
            status: serverFilters.status || 'all',
            per_page: serverFilters.per_page || '25',
        },
        routeName: 'admin.tenant-features.index',
        debounceKeys: ['search'],
    });

    // ─────────────────────────────────────────────────────────
    // Column Visibility
    // ─────────────────────────────────────────────────────────

    const columnConfig = [
        { key: 'tenant', label: 'Tenant' },
        { key: 'feature', label: 'Feature' },
        { key: 'expires_at', label: 'Expires At' },
        { key: 'limit', label: 'Limit' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        'tenant_feature_columns',
        columnConfig.map((col) => col.key),
    );

    // ─────────────────────────────────────────────────────────
    // Active Filter Badges
    // ─────────────────────────────────────────────────────────

    const activeBadges = useMemo(() => {
        const items = [];

        if (filters.search) {
            items.push(
                <Badge key="search" variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button onClick={() => setFilters((p: any) => ({ ...p, search: '' }))}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (filters.status !== 'all') {
            items.push(
                <Badge key="status" variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <button onClick={() => setFilters((p: any) => ({ ...p, status: 'all' }))}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        return items.length ? items : null;
    }, [filters, setFilters]);

    // ─────────────────────────────────────────────────────────
    // Modal Form
    // ─────────────────────────────────────────────────────────

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<TenantFeature | null>(null);

    const [form, setForm] = useState({
        tenant_id: '',
        feature_id: '',
        expires_at: '',
        limit: '',
        is_enabled: true,
    });

    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setForm({
            tenant_id: '',
            feature_id: '',
            expires_at: '',
            limit: '',
            is_enabled: true,
        });
        setEditing(null);
    };

    const openCreate = () => {
        resetForm();
        setFormOpen(true);
    };

    const openEdit = (item: TenantFeature) => {
        setEditing(item);
        setForm({
            tenant_id: item.tenant_id.toString(),
            feature_id: item.feature_id.toString(),
            expires_at: item.expires_at || '',
            limit: item.limit?.toString() || '',
            is_enabled: item.is_enabled,
        });
        setFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            tenant_id: parseInt(form.tenant_id),
            feature_id: parseInt(form.feature_id),
            expires_at: form.expires_at || null,
            limit: form.limit ? parseInt(form.limit) : null,
            is_enabled: form.is_enabled,
        };

        const url = editing
            ? route('admin.tenant-features.update', editing.id)
            : route('admin.tenant-features.store');

        const method = editing ? 'put' : 'post';

        router.visit(url, {
            method,
            data,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                resetForm();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Remove this feature assignment?')) {
            router.delete(route('admin.tenant-features.destroy', id));
        }
    };

    // ─────────────────────────────────────────────────────────
    // Breadcrumbs
    // ─────────────────────────────────────────────────────────

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenant Features' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenant Features" />

            <ListLayout
                title="Tenant Features"
                description="Assign and manage features for each tenant"
                onCreate={openCreate}
                createLabel="Assign Feature"
            >
                <ListToolbar
                    search={filters.search}
                    onSearchChange={(value) => setFilters((p: any) => ({ ...p, search: value }))}
                    status={filters.status}
                    onStatusChange={(v) => {
                        setFilters((p: any) => ({ ...p, status: v }));
                        navigate({ status: v });
                    }}
                    onRefresh={() => navigate({}, true)}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    placeholder="Search tenant or feature..."
                />

                {activeBadges && <ListActiveFilters>{activeBadges}</ListActiveFilters>}

                <CrudTable
                    data={tenantFeatures.data}
                    pagination={tenantFeatures}
                    perPage={parseInt(filters.per_page)}
                    onPerPageChange={(perPage) => navigate({ per_page: perPage }, true)}
                    onPageChange={(page) => navigate({ page }, false)}
                    isLoading={isNavigating}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                >
                    <TableHeader>
                        <TableRow className="border-b bg-muted font-semibold">
                            {visibleColumns.includes('tenant') && <TableHead>Tenant</TableHead>}
                            {visibleColumns.includes('feature') && <TableHead>Feature</TableHead>}
                            {visibleColumns.includes('expires_at') && <TableHead>Expires At</TableHead>}
                            {visibleColumns.includes('limit') && <TableHead>Limit</TableHead>}
                            {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {tenantFeatures.data.map((tf: TenantFeature) => (
                            <TableRow key={tf.id}>
                                {visibleColumns.includes('tenant') && (
                                    <TableCell className="font-medium">
                                        {tf.tenant?.name || `Tenant #${tf.tenant_id}`}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('feature') && (
                                    <TableCell>
                                        {tf.feature?.name || tf.feature?.key || `Feature #${tf.feature_id}`}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('expires_at') && (
                                    <TableCell>
                                        {tf.expires_at ? new Date(tf.expires_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('limit') && (
                                    <TableCell>{tf.limit ?? 'Unlimited'}</TableCell>
                                )}

                                {visibleColumns.includes('status') && (
                                    <TableCell>
                                        {tf.is_enabled ? (
                                            <Badge className="bg-green-500 text-white">Enabled</Badge>
                                        ) : (
                                            <Badge className="bg-gray-500 text-white">Disabled</Badge>
                                        )}
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
                                            <DropdownMenuItem onClick={() => openEdit(tf)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(tf.id)}
                                                className="text-red-600"
                                            >
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

            {/* ───────────────────────────────────────────────────────── */}
            {/* Create / Edit Dialog */}
            {/* ───────────────────────────────────────────────────────── */}
            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open) resetForm();
                    setFormOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Tenant Feature' : 'Assign Feature to Tenant'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? 'Update the feature assignment for this tenant.'
                                : 'Select a tenant and feature to assign.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tenant_id">Tenant</Label>
                            <Select
                                value={form.tenant_id}
                                onValueChange={(v) => setForm({ ...form, tenant_id: v })}
                                disabled={!!editing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name} {t.slug ? `(${t.slug})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feature_id">Feature</Label>
                            <Select
                                value={form.feature_id}
                                onValueChange={(v) => setForm({ ...form, feature_id: v })}
                                disabled={!!editing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select feature" />
                                </SelectTrigger>
                                <SelectContent>
                                    {features.map((f: any) => (
                                        <SelectItem key={f.id} value={f.id.toString()}>
                                            {f.name} ({f.key})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expires At</Label>
                            <Input
                                id="expires_at"
                                type="date"
                                value={form.expires_at}
                                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="limit">Usage Limit (optional)</Label>
                            <Input
                                id="limit"
                                type="number"
                                placeholder="Leave empty for unlimited"
                                value={form.limit}
                                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="enabled">Enabled</Label>
                                <p className="text-sm text-muted-foreground">
                                    Controls whether this feature is active for the tenant
                                </p>
                            </div>
                            <Switch
                                id="enabled"
                                checked={form.is_enabled}
                                onCheckedChange={(checked) => setForm({ ...form, is_enabled: checked })}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : editing ? 'Update Assignment' : 'Assign Feature'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
