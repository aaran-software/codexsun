// resources/js/Pages/Admin/Menus/MenuFormModal.tsx
'use client';

import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

import type { Menu } from './types';

type ModalMode = 'create' | 'edit' | null;

interface MenuFormModalProps {
    open: boolean;
    mode: ModalMode;
    menu: Menu | null;
    menuGroups: Array<{ id: number; name: string }>;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function MenuFormModal({
    open,
    mode,
    menu,
    menuGroups,
    onClose,
    onSuccess,
}: MenuFormModalProps) {
    const route = useRoute();

    const form = useForm({
        menu_group_id: '',
        title: '',
        url: '',
        feature_key: '',
        position: 0,
        is_active: true,
    });

    const [touched, setTouched] = useState({
        title: false,
        menu_group_id: false,
    });

    useEffect(() => {
        if (!open) return;

        if (mode === 'edit' && menu) {
            form.setData({
                menu_group_id: menu.menu_group_id.toString(),
                title: menu.title,
                url: menu.url || '',
                feature_key: menu.feature_key || '',
                position: menu.position,
                is_active: menu.is_active,
            });
        } else {
            form.reset();
            form.clearErrors();
            form.setData({
                menu_group_id: '',
                title: '',
                url: '',
                feature_key: '',
                position: 0,
                is_active: true,
            });
        }

        setTouched({ title: false, menu_group_id: false });
    }, [open, mode, menu]);

    const validateTitle = (value: string) => {
        if (!value.trim()) {
            form.setError('title', 'Title is required');
            return false;
        }
        if (value.length > 120) {
            form.setError('title', 'Title cannot exceed 120 characters');
            return false;
        }
        form.clearErrors('title');
        return true;
    };

    const validateGroup = (value: string) => {
        if (!value) {
            form.setError('menu_group_id', 'Please select a menu group');
            return false;
        }
        form.clearErrors('menu_group_id');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isTitleValid = validateTitle(form.data.title);
        const isGroupValid = validateGroup(form.data.menu_group_id);

        if (!isTitleValid || !isGroupValid) {
            if (!isTitleValid) document.getElementById('title')?.focus();
            else document.getElementById('menu_group_id')?.focus();
            return;
        }

        const options = {
            onSuccess: () => {
                form.reset();
                onClose();
                onSuccess?.();
            },
            preserveScroll: true,
        };

        if (mode === 'create') {
            form.post(route('admin.menus.store'), options);
        } else if (mode === 'edit' && menu) {
            form.put(route('admin.menus.update', menu.id), options);
        }
    };

    const isSubmitDisabled =
        form.processing || !form.data.title.trim() || !form.data.menu_group_id;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Create Menu Item'
                            : 'Edit Menu Item'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new menu entry'
                            : 'Modify existing menu item'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Menu Group */}
                    <div className="space-y-2">
                        <Label htmlFor="menu_group_id">Menu Group *</Label>
                        <Select
                            value={form.data.menu_group_id}
                            onValueChange={(v) => {
                                form.setData('menu_group_id', v);
                                if (touched.menu_group_id) validateGroup(v);
                            }}
                            disabled={form.processing}
                        >
                            <SelectTrigger
                                id="menu_group_id"
                                className={
                                    form.errors.menu_group_id &&
                                    touched.menu_group_id
                                        ? 'border-destructive'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Select menu group" />
                            </SelectTrigger>
                            <SelectContent>
                                {menuGroups.map((group) => (
                                    <SelectItem
                                        key={group.id}
                                        value={group.id.toString()}
                                    >
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.menu_group_id && touched.menu_group_id && (
                            <p className="text-sm text-destructive">
                                {form.errors.menu_group_id}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Home, Services, Contact"
                            value={form.data.title}
                            onChange={(e) => {
                                form.setData('title', e.target.value);
                                if (touched.title)
                                    validateTitle(e.target.value);
                            }}
                            onBlur={() => {
                                setTouched((p) => ({ ...p, title: true }));
                                validateTitle(form.data.title);
                            }}
                            disabled={form.processing}
                            className={
                                form.errors.title && touched.title
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {form.errors.title && touched.title && (
                            <p className="text-sm text-destructive">
                                {form.errors.title}
                            </p>
                        )}
                    </div>

                    {/* URL */}
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            placeholder="/dashboard or https://example.com"
                            value={form.data.url}
                            onChange={(e) =>
                                form.setData('url', e.target.value)
                            }
                            disabled={form.processing}
                        />
                    </div>

                    {/* Feature Key */}
                    <div className="space-y-2">
                        <Label htmlFor="feature_key">
                            Feature Key (optional)
                        </Label>
                        <Input
                            id="feature_key"
                            placeholder="e.g. dashboard, billing, team"
                            value={form.data.feature_key}
                            onChange={(e) =>
                                form.setData('feature_key', e.target.value)
                            }
                            disabled={form.processing}
                        />
                        <p className="text-xs text-muted-foreground">
                            Visible only if this feature is enabled for the
                            tenant
                        </p>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            type="number"
                            min="0"
                            value={form.data.position}
                            onChange={(e) =>
                                form.setData('position', Number(e.target.value))
                            }
                            disabled={form.processing}
                        />
                    </div>

                    {/* Active */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive items are hidden from the frontend
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked)
                            }
                            disabled={form.processing}
                        />
                    </div>

                    <DialogFooter className="gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || isSubmitDisabled}
                        >
                            {form.processing
                                ? 'Saving...'
                                : mode === 'create'
                                  ? 'Create Menu Item'
                                  : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
