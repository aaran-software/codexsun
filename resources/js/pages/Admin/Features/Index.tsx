// resources/js/pages/Admin/Features/Index.tsx
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
import { Switch } from '@/components/ui/switch';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Feature = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export default function FeaturesIndex() {
    const pageProps = usePage().props as any;
    const features = pageProps.features;
    const serverFilters = pageProps.filters ?? {};
    const route = useRoute();

    /* ---------------------------------------------------------
       CRUD Filters
    ---------------------------------------------------------- */

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters.search || '',
            status: serverFilters.status || 'all',
            per_page: serverFilters.per_page || '25',
        },
        routeName: 'admin.features.index',
        debounceKeys: ['search'],
    });

    /* ---------------------------------------------------------
       Column Visibility
    ---------------------------------------------------------- */

    const columnConfig = [
        { key: 'key', label: 'Key' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        'feature_columns',
        columnConfig.map((col) => col.key),
    );

    /* ---------------------------------------------------------
       Active Filter Badges
    ---------------------------------------------------------- */

    const activeBadges = useMemo(() => {
        const items = [];

        if (filters.search) {
            items.push(
                <Badge key="search" variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button
                        onClick={() =>
                            setFilters((p: any) => ({ ...p, search: '' }))
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
    }, [filters, setFilters]);

    /* ---------------------------------------------------------
       Modal State
    ---------------------------------------------------------- */

    const [formOpen, setFormOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

    const [form, setForm] = useState({
        key: '',
        name: '',
        description: '',
        is_active: true,
    });

    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setForm({
            key: '',
            name: '',
            description: '',
            is_active: true,
        });
        setEditingFeature(null);
    };

    const openCreate = () => {
        resetForm();
        setFormOpen(true);
    };

    const openEdit = (feature: Feature) => {
        setEditingFeature(feature);
        setForm({
            key: feature.key,
            name: feature.name,
            description: feature.description || '',
            is_active: feature.is_active,
        });
        setFormOpen(true);
    };

    /* ---------------------------------------------------------
       Form Submit
    ---------------------------------------------------------- */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            key: form.key.trim(),
            name: form.name.trim(),
            description: form.description.trim() || null,
            is_active: form.is_active,
        };

        const url = editingFeature
            ? route('admin.features.update', editingFeature.id)
            : route('admin.features.store');

        const method = editingFeature ? 'put' : 'post';

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

    /* ---------------------------------------------------------
       Actions
    ---------------------------------------------------------- */

    const handleDelete = (id: number) => {
        if (confirm('Move feature to trash?')) {
            router.delete(route('admin.features.destroy', id));
        }
    };

    const handleRestore = (id: number) => {
        router.patch(route('admin.features.restore', id));
    };

    /* ---------------------------------------------------------
       Breadcrumbs
    ---------------------------------------------------------- */

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        {
            title: 'Features',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Features" />

            <ListLayout
                title="Features"
                description="Manage available tenant features and modules"
                onCreate={openCreate}
                createLabel="New Feature"
            >
                <ListToolbar
                    search={filters.search}
                    onSearchChange={(value) =>
                        setFilters((p: any) => ({ ...p, search: value }))
                    }
                    status={filters.status}
                    onStatusChange={(v) => {
                        setFilters((p: any) => ({ ...p, status: v }));
                        navigate({ status: v });
                    }}
                    onRefresh={() => navigate({}, true)}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    placeholder="Search key, name..."
                />

                {activeBadges && (
                    <ListActiveFilters>{activeBadges}</ListActiveFilters>
                )}

                <CrudTable
                    data={features.data}
                    pagination={features}
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
                            {visibleColumns.includes('key') && (
                                <TableHead>Key</TableHead>
                            )}
                            {visibleColumns.includes('name') && (
                                <TableHead>Name</TableHead>
                            )}
                            {visibleColumns.includes('description') && (
                                <TableHead>Description</TableHead>
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
                        {features.data.map((feature: Feature) => (
                            <TableRow key={feature.id}>
                                {visibleColumns.includes('key') && (
                                    <TableCell className="font-mono text-sm">
                                        {feature.key}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('name') && (
                                    <TableCell className="font-medium">
                                        {feature.name}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('description') && (
                                    <TableCell className="text-muted-foreground">
                                        {feature.description
                                            ? feature.description.length > 80
                                                ? feature.description.substring(
                                                      0,
                                                      78,
                                                  ) + '...'
                                                : feature.description
                                            : '—'}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('status') && (
                                    <TableCell>
                                        {feature.deleted_at ? (
                                            <Badge className="bg-red-600 text-white">
                                                Trashed
                                            </Badge>
                                        ) : feature.is_active ? (
                                            <Badge className="bg-green-500 text-white">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-500 text-white">
                                                Inactive
                                            </Badge>
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
                                            {!feature.deleted_at && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(feature)
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                feature.id,
                                                            )
                                                        }
                                                        className="text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {feature.deleted_at && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRestore(
                                                            feature.id,
                                                        )
                                                    }
                                                >
                                                    Restore
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </CrudTable>
            </ListLayout>

            {/* Create / Edit Dialog */}
            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open) resetForm();
                    setFormOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>
                            {editingFeature
                                ? 'Edit Feature'
                                : 'Create New Feature'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingFeature
                                ? 'Update the feature details below.'
                                : 'Add a new feature that tenants can enable/disable.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="key">Feature Key</Label>
                            <Input
                                id="key"
                                placeholder="e.g. ecommerce, blog, inventory"
                                value={form.key}
                                onChange={(e) =>
                                    setForm({ ...form, key: e.target.value })
                                }
                                disabled={!!editingFeature}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used internally — lowercase, no spaces (allowed:
                                a-z 0-9 _ -)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. E-Commerce, Blog, Chat Module"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of what this feature provides..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="active">Feature Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Controls default availability for new
                                    tenants
                                </p>
                            </div>
                            <Switch
                                id="active"
                                checked={form.is_active}
                                onCheckedChange={(checked) =>
                                    setForm({ ...form, is_active: checked })
                                }
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
                                {submitting
                                    ? 'Saving...'
                                    : editingFeature
                                      ? 'Update Feature'
                                      : 'Create Feature'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
