// resources/js/components/shared/EntityListPage.tsx
'use client';

import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import CrudTable from '@/components/table/CrudTable';
import ListActiveFilters from '@/components/table/ListActiveFilters';
import ListLayout from '@/components/table/ListLayoutNew';
import ListToolbar from '@/components/table/ListToolbar';
import { useColumnVisibility } from '@/components/table/useColumnVisibility';
import { useCrudFilters } from '@/components/table/useCrudFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { BreadcrumbItem } from '@/types';
import type { EntityKey, FormDataFor } from './entities';

type ColumnDef<T> = {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
    className?: string;
    visibleByDefault?: boolean;
};

interface Entity {
    id: number;
    [key: string]: unknown;
}

interface EntityListPageProps<T extends Entity, K extends EntityKey> {
    entityName: string;
    entities: { data: T[]; links: any; meta: any };
    routePrefix: K;
    title: string;
    description: string;
    placeholder: string;
    breadcrumbs: BreadcrumbItem[];
    columns: ColumnDef<T>[];
    initialFormData: FormDataFor<K>;
    formChildren: (props: {
        formData: FormDataFor<K>;
        setFormData: React.Dispatch<React.SetStateAction<FormDataFor<K>>>;
        errors: Record<string, string>;
        isEditing: boolean;
    }) => ReactNode;
    createLabel?: string;
    bulkActivateRoute?: string;
    bulkDeactivateRoute?: string;
    bulkDestroyRoute?: string;
}

export function EntityListPage<T extends Entity, K extends EntityKey>({
    entityName,
    entities,
    routePrefix,
    title,
    description,
    placeholder,
    breadcrumbs,
    columns,
    initialFormData,
    formChildren,
    createLabel = `New ${entityName}`,
    bulkActivateRoute,
    bulkDeactivateRoute,
    bulkDestroyRoute,
}: EntityListPageProps<T, K>) {
    const route = useRoute();
    const serverFilters = entities?.meta?.filters ?? {};

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters.search || '',
            status: serverFilters.status || 'all',
            per_page: serverFilters.per_page || '25',
        },
        routeName: `${routePrefix}.index`,
        debounceKeys: ['search'],
    });

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        `${routePrefix}_columns`,
        columns
            .filter((c) => c.key !== 'select' && c.visibleByDefault !== false)
            .map((c) => c.key),
    );

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const allSelected =
        selectedIds.length === entities.data.length && entities.data.length > 0;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < entities.data.length;

    const toggleAll = () =>
        allSelected || someSelected
            ? setSelectedIds([])
            : setSelectedIds(entities.data.map((e) => e.id));
    const toggleOne = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );

    const [bulkActionOpen, setBulkActionOpen] = useState(false);
    const [selectedBulkAction, setSelectedBulkAction] = useState<string>('');

    // EntityListPage.tsx → replace only the handleBulkAction function
    const handleBulkAction = () => {
        if (!selectedBulkAction || selectedIds.length === 0) return;
        const payload = { ids: selectedIds };
        let endpoint = '';
        let method: 'post' | 'put' | 'delete' = 'post';

        switch (selectedBulkAction) {
            case 'activate': endpoint = bulkActivateRoute || route(`${routePrefix}.bulk-activate`); method = 'put'; break;
            case 'deactivate': endpoint = bulkDeactivateRoute || route(`${routePrefix}.bulk-deactivate`); method = 'put'; break;
            case 'delete': endpoint = bulkDestroyRoute || route(`${routePrefix}.bulk-destroy`); method = 'delete'; break;
            default: return;
        }

        router.visit(endpoint, { method, data: payload, preserveState: true, preserveScroll: true, onSuccess: () => { setSelectedIds([]); setBulkActionOpen(false); setSelectedBulkAction(''); } });
    };

    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [formData, setFormData] = useState<FormDataFor<K>>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingItem(null);
        setErrors({});
    };

    const openCreate = () => {
        resetForm();
        setFormOpen(true);
    };

    const openEdit = (item: T) => {
        setEditingItem(item);
        const newData = { ...initialFormData };
        Object.keys(initialFormData).forEach((key) => {
            if (key in item) (newData as any)[key] = (item as any)[key];
        });
        setFormData(newData as FormDataFor<K>);
        setErrors({});
        setFormOpen(true);
    };

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setDeleteOpen(true);
    };
    const confirmDelete = () => {
        if (itemToDelete !== null) {
            router.delete(route(`${routePrefix}.destroy`, itemToDelete), {
                preserveScroll: true,
                onFinish: () => {
                    setDeleteOpen(false);
                    setItemToDelete(null);
                },
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || String(formData.name).trim() === '')
            newErrors.name = 'Name is required';
        else if (String(formData.name).length < 2)
            newErrors.name = 'Name must be at least 2 characters';

        if (
            'state_code' in formData &&
            formData.state_code &&
            String(formData.state_code).length > 10
        )
            newErrors.state_code = 'State code too long';
        if (
            'country_code' in formData &&
            formData.country_code &&
            String(formData.country_code).length > 3
        )
            newErrors.country_code = 'Country code too long';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const url = editingItem
            ? route(`${routePrefix}.update`, editingItem.id)
            : route(`${routePrefix}.store`);
        router.visit(url, {
            method: editingItem ? 'put' : 'post',
            data: formData,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                resetForm();
            },
        });
    };

    const activeBadges = useMemo(() => {
        const items: ReactNode[] = [];
        if (filters.search)
            items.push(
                <Badge key="search" variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button
                        onClick={() =>
                            setFilters((p) => ({ ...p, search: '' }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        if (filters.status !== 'all')
            items.push(
                <Badge key="status" variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <button
                        onClick={() =>
                            setFilters((p) => ({ ...p, status: 'all' }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        return items.length ? items : null;
    }, [filters, setFilters]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <ListLayout
                title={title}
                description={description}
                onCreate={openCreate}
                createLabel={createLabel}
            >
                <ListToolbar
                    search={filters.search}
                    onSearchChange={(v) =>
                        setFilters((p) => ({ ...p, search: v }))
                    }
                    status={filters.status}
                    onStatusChange={(v) => {
                        setFilters((p) => ({ ...p, status: v }));
                        navigate({ status: v });
                    }}
                    onRefresh={() => navigate({}, true)}
                    columnConfig={columns.filter((c) => c.key !== 'select')}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    placeholder={placeholder}
                />

                {activeBadges && (
                    <ListActiveFilters>{activeBadges}</ListActiveFilters>
                )}

                {selectedIds.length > 0 && (
                    <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIds([])}
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={selectedBulkAction}
                                onValueChange={setSelectedBulkAction}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Bulk actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activate">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            Activate
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="deactivate">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-amber-600" />
                                            Deactivate
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="delete">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                variant={
                                    selectedBulkAction === 'delete'
                                        ? 'destructive'
                                        : 'default'
                                }
                                onClick={() => setBulkActionOpen(true)}
                                disabled={!selectedBulkAction}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}

                <CrudTable
                    data={entities.data}
                    pagination={entities}
                    perPage={parseInt(filters.per_page)}
                    onPerPageChange={(p) => navigate({ per_page: p }, true)}
                    onPageChange={(p) => navigate({ page: p }, false)}
                    isLoading={isNavigating}
                    columnConfig={columns}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                >
                    <TableHeader>
                        <TableRow className="border-b bg-muted font-semibold">
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleAll}
                                    aria-label="Select all rows"
                                />
                            </TableHead>
                            {columns.map(
                                (col) =>
                                    (col.key === 'select' ||
                                        visibleColumns.includes(col.key)) && (
                                        <TableHead
                                            key={col.key}
                                            className={col.className}
                                        >
                                            {col.label}
                                        </TableHead>
                                    ),
                            )}
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entities.data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="w-10">
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        onCheckedChange={() =>
                                            toggleOne(item.id)
                                        }
                                        aria-label={`Select row ${item.id}`}
                                    />
                                </TableCell>
                                {columns.map(
                                    (col) =>
                                        (col.key === 'select' ||
                                            visibleColumns.includes(
                                                col.key,
                                            )) && (
                                            <TableCell
                                                key={col.key}
                                                className={col.className}
                                            >
                                                {col.render
                                                    ? col.render(item)
                                                    : ((
                                                          item as Record<
                                                              string,
                                                              unknown
                                                          >
                                                      )[col.key] ?? '—')}
                                            </TableCell>
                                        ),
                                )}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => openEdit(item)}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    handleDeleteClick(item.id)
                                                }
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

            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open) resetForm();
                    setFormOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem
                                ? `Edit ${entityName}`
                                : `Create ${entityName}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {formChildren({
                            formData,
                            setFormData,
                            errors,
                            isEditing: !!editingItem,
                        })}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={confirmDelete}
                title={`Delete ${entityName}?`}
                description={`This will permanently delete the selected ${entityName.toLowerCase()}.`}
            />

            <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedBulkAction === 'delete'
                                ? `Delete ${selectedIds.length} ${entityName.toLowerCase()}${selectedIds.length !== 1 ? 's' : ''}?`
                                : selectedBulkAction === 'activate'
                                  ? `Activate ${selectedIds.length} ${entityName.toLowerCase()}${selectedIds.length !== 1 ? 's' : ''}?`
                                  : `Deactivate ${selectedIds.length} ${entityName.toLowerCase()}${selectedIds.length !== 1 ? 's' : ''}?`}
                        </DialogTitle>
                        <DialogDescription>
                            This action will affect {selectedIds.length}{' '}
                            selected item{selectedIds.length !== 1 ? 's' : ''}.
                            {selectedBulkAction === 'delete' &&
                                ' This cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkActionOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={
                                selectedBulkAction === 'delete'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={handleBulkAction}
                            disabled={isNavigating}
                        >
                            {isNavigating ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
