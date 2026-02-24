// resources/js/Pages/Admin/MenuGroups/Index.tsx
'use client';

import { Head, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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

import type { BreadcrumbItem } from '@/types';

import MenuGroupFormModal from './MenuGroupFormModal'; // ← you'll create this next
import type { MenuGroup, ModalMode } from './types'; // ← shared types file

export default function MenuGroupsIndex() {
    const props = usePage().props as any;
    const { menuGroups, filters: serverFilters } = props;
    const route = useRoute();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedGroup, setSelectedGroup] = useState<MenuGroup | null>(null);

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters?.search || '',
            status: serverFilters?.status || 'all',
            per_page: serverFilters?.per_page || '25',
        },
        routeName: 'admin.menu-groups.index',
        debounceKeys: ['search'],
    });

    const columnConfig = [
        { key: 'name', label: 'Name' },
        { key: 'location', label: 'Location' },
        { key: 'menus', label: 'Menus' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        'admin-menugroups-columns',
        columnConfig.map((c) => c.key),
    );

    // Modal handlers
    const openCreateModal = () => {
        setSelectedGroup(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const openEditModal = (group: MenuGroup) => {
        setSelectedGroup(group);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleRefresh = () => {
        router.reload({ only: ['menuGroups', 'flash'], preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Move this menu group to trash?')) return;
        router.delete(route('admin.menu-groups.destroy', id), {
            onSuccess: handleRefresh,
            preserveScroll: true,
        });
    };

    const handleRestore = (id: number) => {
        router.patch(route('admin.menu-groups.restore', id), undefined, {
            onSuccess: handleRefresh,
            preserveScroll: true,
        });
    };

    const activeBadges = useMemo(() => {
        const items: JSX.Element[] = [];

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
                    Status:{' '}
                    {filters.status === 'active'
                        ? 'Active'
                        : filters.status === 'inactive'
                          ? 'Inactive'
                          : 'Trash'}
                    <button
                        onClick={() =>
                            setFilters((p: any) => ({ ...p, status: 'all' }))
                        }
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        return items.length ? items : null;
    }, [filters, setFilters]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Menu Groups', href: route('admin.menu-groups.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Groups" />

            <ListLayout
                title="Menu Groups"
                description="Manage locations for menus (header, footer, sidebar, etc.)"
            >
                <div className="-mt-16 mb-8 flex justify-end">
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative max-w-sm min-w-70 flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search name, location..."
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
                            onValueChange={(v) => {
                                setFilters((p: any) => ({ ...p, status: v }));
                                navigate({ status: v });
                            }}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                                <SelectItem value="deleted">Trash</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate({}, true)}
                            title="Reset filters"
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

                {activeBadges && (
                    <div className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-muted/40 p-3">
                        {activeBadges}
                    </div>
                )}

                <CrudTable
                    data={menuGroups.data}
                    pagination={menuGroups}
                    perPage={Number(filters.per_page)}
                    onPerPageChange={(val) =>
                        navigate({ per_page: val.toString() }, true)
                    }
                    onPageChange={(page) => navigate({ page }, false)}
                    isLoading={isNavigating}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                >
                    <TableHeader>
                        <TableRow className="border-b bg-muted/60">
                            {visibleColumns.includes('name') && (
                                <TableHead>Name</TableHead>
                            )}
                            {visibleColumns.includes('location') && (
                                <TableHead>Location</TableHead>
                            )}
                            {visibleColumns.includes('menus') && (
                                <TableHead>Menus</TableHead>
                            )}
                            {visibleColumns.includes('status') && (
                                <TableHead>Status</TableHead>
                            )}
                            <TableHead className="w-24 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {menuGroups.data.map((group: MenuGroup) => (
                            <TableRow key={group.id}>
                                {visibleColumns.includes('name') && (
                                    <TableCell className="font-medium">
                                        {group.name}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('location') && (
                                    <TableCell className="text-muted-foreground">
                                        {group.location || '—'}
                                    </TableCell>
                                )}

                                {visibleColumns.includes('menus') && (
                                    <TableCell>{group.menus_count}</TableCell>
                                )}

                                {visibleColumns.includes('status') && (
                                    <TableCell>
                                        {group.deleted_at ? (
                                            <Badge variant="destructive">
                                                Trashed
                                            </Badge>
                                        ) : group.is_active ? (
                                            <Badge className="bg-green-600 hover:bg-green-600/90">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                )}

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {!group.deleted_at && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEditModal(group)
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                group.id,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {group.deleted_at && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRestore(group.id)
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

            <MenuGroupFormModal
                open={modalOpen}
                mode={modalMode}
                group={selectedGroup}
                onClose={() => setModalOpen(false)}
                onSuccess={handleRefresh}
            />
        </AppLayout>
    );
}
