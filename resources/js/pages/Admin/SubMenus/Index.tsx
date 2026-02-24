// resources/js/Pages/Admin/SubMenus/Index.tsx
'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, router, usePage } from '@inertiajs/react';
import {
    GripVertical,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { JSX, useEffect, useMemo, useState } from 'react';
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

import SubMenuFormModal from './SubMenuFormModal';
import type { ModalMode, SubMenu } from './types';

// ── Drag Handle Component ────────────────────────────────────────
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({ id });

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <GripVertical className="h-4 w-4" />
        </Button>
    );
}

// ── Sortable Row ─────────────────────────────────────────────────
function SortableSubMenuRow({
    subMenu,
    children,
}: {
    subMenu: SubMenu;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: subMenu.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        backgroundColor: isDragging ? '#f8fafc' : undefined,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'bg-muted/30 shadow-md' : ''}
            {...attributes}
            {...listeners}
        >
            {children}
        </TableRow>
    );
}

export default function SubMenusIndex() {
    const props = usePage().props as any;
    const { sub_menus, filters: serverFilters, menus = [] } = props;

    const route = useRoute();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedSubMenu, setSelectedSubMenu] = useState<SubMenu | null>(
        null,
    );

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters?.search || '',
            status: serverFilters?.status || 'all',
            per_page: serverFilters?.per_page || '25',
        },
        routeName: 'admin.sub-menus.index',
        debounceKeys: ['search'],
    });

    const [orderedSubMenus, setOrderedSubMenus] = useState<SubMenu[]>(
        sub_menus.data || [],
    );

    useEffect(() => {
        setOrderedSubMenus(sub_menus.data || []);
    }, [sub_menus.data]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedSubMenus.findIndex((m) => m.id === active.id);
        const newIndex = orderedSubMenus.findIndex((m) => m.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(orderedSubMenus, oldIndex, newIndex);

        const updatedOrder = newOrder.map((item, index) => ({
            ...item,
            position: index,
        }));

        setOrderedSubMenus(updatedOrder);

        router.post(
            route('admin.sub-menus.reorder'),
            {
                order: updatedOrder.map((m) => ({
                    id: m.id,
                    position: m.position,
                })),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    router.reload({ only: ['sub_menus'] });
                },
                onError: () => {
                    setOrderedSubMenus(sub_menus.data || []);
                },
            },
        );
    };

    const columnConfig = [
        { key: 'drag', label: '' },
        { key: 'title', label: 'Title' },
        { key: 'url', label: 'URL' },
        { key: 'menu', label: 'Parent Menu' },
        { key: 'feature_key', label: 'Feature Key' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        'admin-sub-menus-columns',
        columnConfig.map((c) => c.key),
    );

    const openCreateModal = () => {
        setSelectedSubMenu(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const openEditModal = (subMenu: SubMenu) => {
        setSelectedSubMenu(subMenu);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleRefresh = () => {
        router.reload({ only: ['sub_menus', 'flash'], preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this sub menu item?')) return;
        router.delete(route('admin.sub-menus.destroy', id), {
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
                    {filters.status === 'active' ? 'Active' : 'Inactive'}
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
        { title: 'Sub Menus', href: route('admin.sub-menus.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sub Menus" />

            <ListLayout
                title="Sub Menus"
                description="Manage sub navigation items under each menu"
            >
                <div className="-mt-16 mb-8 flex justify-end">
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Sub Menu
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative max-w-sm min-w-70 flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search title, url, feature key..."
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

                {activeBadges && (
                    <div className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-muted/40 p-3">
                        {activeBadges}
                    </div>
                )}

                {/* Drag & Drop Table */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={orderedSubMenus.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <CrudTable
                            data={orderedSubMenus}
                            pagination={sub_menus}
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
                                    {visibleColumns.includes('drag') && (
                                        <TableHead className="w-10"></TableHead>
                                    )}
                                    {visibleColumns.includes('title') && (
                                        <TableHead>Title</TableHead>
                                    )}
                                    {visibleColumns.includes('url') && (
                                        <TableHead>URL</TableHead>
                                    )}
                                    {visibleColumns.includes('menu') && (
                                        <TableHead>Parent Menu</TableHead>
                                    )}
                                    {visibleColumns.includes('feature_key') && (
                                        <TableHead>Feature Key</TableHead>
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
                                {orderedSubMenus.map((subMenu: SubMenu) => (
                                    <SortableSubMenuRow
                                        key={subMenu.id}
                                        subMenu={subMenu}
                                    >
                                        {visibleColumns.includes('drag') && (
                                            <TableCell className="w-10 p-0">
                                                <DragHandle id={subMenu.id} />
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('title') && (
                                            <TableCell className="font-medium">
                                                {subMenu.title}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('url') && (
                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                {subMenu.url || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('menu') && (
                                            <TableCell>
                                                {subMenu.menu?.title || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes(
                                            'feature_key',
                                        ) && (
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {subMenu.feature_key || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('status') && (
                                            <TableCell>
                                                {subMenu.is_active ? (
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEditModal(
                                                                subMenu,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                subMenu.id,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </SortableSubMenuRow>
                                ))}
                            </TableBody>
                        </CrudTable>
                    </SortableContext>
                </DndContext>
            </ListLayout>

            <SubMenuFormModal
                open={modalOpen}
                mode={modalMode}
                subMenu={selectedSubMenu}
                menus={menus}
                onClose={() => setModalOpen(false)}
                onSuccess={handleRefresh}
            />
        </AppLayout>
    );
}
