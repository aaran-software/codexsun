// resources/js/Pages/Admin/Menus/Index.tsx
'use client';

import type {
    DragEndEvent} from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
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
import { useEffect, useMemo, useState } from 'react';
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

import MenuFormModal from './MenuFormModal';
import type { Menu, ModalMode } from './types';

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
function SortableMenuRow({
    menu,
    children,
}: {
    menu: Menu;
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
        id: menu.id,
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

export default function MenusIndex() {
    const props = usePage().props as any;
    const { menus, filters: serverFilters, menuGroups = [] } = props;

    const route = useRoute();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

    const { filters, setFilters, navigate, isNavigating } = useCrudFilters({
        initialFilters: {
            search: serverFilters?.search || '',
            status: serverFilters?.status || 'all',
            per_page: serverFilters?.per_page || '25',
        },
        routeName: 'admin.menus.index',
        debounceKeys: ['search'],
    });

    const [orderedMenus, setOrderedMenus] = useState<Menu[]>(menus.data || []);

    useEffect(() => {
        setOrderedMenus(menus.data || []);
    }, [menus.data]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedMenus.findIndex((m) => m.id === active.id);
        const newIndex = orderedMenus.findIndex((m) => m.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(orderedMenus, oldIndex, newIndex);

        // Assign new positions (0, 1, 2, ...)
        const updatedOrder = newOrder.map((menu, index) => ({
            ...menu,
            position: index,
        }));

        // Optimistic update
        setOrderedMenus(updatedOrder);

        // Send to backend
        router.post(
            route('admin.menus.reorder'),
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
                    router.reload({ only: ['menus'] });
                },
                onError: () => {
                    // Revert on error
                    setOrderedMenus(menus.data || []);
                },
            },
        );
    };

    const columnConfig = [
        { key: 'drag', label: '' }, // Drag handle
        { key: 'title', label: 'Title' },
        { key: 'url', label: 'URL' },
        { key: 'group', label: 'Group' },
        { key: 'status', label: 'Status' },
    ];

    const { visibleColumns, toggleColumn } = useColumnVisibility(
        'admin-menus-columns',
        columnConfig.map((c) => c.key),
    );

    const openCreateModal = () => {
        setSelectedMenu(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const openEditModal = (menu: Menu) => {
        setSelectedMenu(menu);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleRefresh = () => {
        router.reload({ only: ['menus', 'flash'], preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Move this menu item to trash?')) return;
        router.delete(route('admin.menus.destroy', id), {
            onSuccess: handleRefresh,
            preserveScroll: true,
        });
    };

    const handleRestore = (id: number) => {
        router.patch(route('admin.menus.restore', id), undefined, {
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
        { title: 'Menus', href: route('admin.menus.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menus" />

            <ListLayout title="Menus" description="Manage navigation items">
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
                                <SelectItem value="deleted">Trash</SelectItem>
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
                        items={orderedMenus.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <CrudTable
                            data={orderedMenus}
                            pagination={menus}
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
                                    {visibleColumns.includes('group') && (
                                        <TableHead>Group</TableHead>
                                    )}
                                    {visibleColumns.includes('group') && (
                                        <TableHead>Position</TableHead>
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
                                {orderedMenus.map((menu: Menu) => (
                                    <SortableMenuRow key={menu.id} menu={menu}>
                                        {visibleColumns.includes('drag') && (
                                            <TableCell className="w-10 p-0">
                                                <DragHandle id={menu.id} />
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('title') && (
                                            <TableCell className="font-medium">
                                                {menu.title}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('url') && (
                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                {menu.url || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('group') && (
                                            <TableCell>
                                                {menu.group?.name || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('group') && (
                                            <TableCell>
                                                {menu.position || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('status') && (
                                            <TableCell>
                                                {menu.deleted_at ? (
                                                    <Badge variant="destructive">
                                                        Trashed
                                                    </Badge>
                                                ) : menu.is_active ? (
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
                                                    {!menu.deleted_at && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        menu,
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        menu.id,
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {menu.deleted_at && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRestore(
                                                                    menu.id,
                                                                )
                                                            }
                                                        >
                                                            Restore
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </SortableMenuRow>
                                ))}
                            </TableBody>
                        </CrudTable>
                    </SortableContext>
                </DndContext>
            </ListLayout>

            <MenuFormModal
                open={modalOpen}
                mode={modalMode}
                menu={selectedMenu}
                menuGroups={menuGroups}
                onClose={() => setModalOpen(false)}
                onSuccess={handleRefresh}
            />
        </AppLayout>
    );
}
