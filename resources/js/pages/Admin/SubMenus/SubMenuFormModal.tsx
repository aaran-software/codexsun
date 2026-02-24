// resources/js/Pages/Admin/SubMenus/SubMenuFormModal.tsx
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

import type { SubMenu } from './types';

type ModalMode = 'create' | 'edit' | null;

interface SubMenuFormModalProps {
    open: boolean;
    mode: ModalMode;
    subMenu: SubMenu | null;
    menus: Array<{ id: number; title: string }>;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SubMenuFormModal({
    open,
    mode,
    subMenu,
    menus,
    onClose,
    onSuccess,
}: SubMenuFormModalProps) {
    const route = useRoute();

    const form = useForm({
        menu_id: '',
        title: '',
        url: '',
        feature_key: '',
        position: 0,
        is_active: true,
    });

    const [touched, setTouched] = useState({
        title: false,
        menu_id: false,
    });

    useEffect(() => {
        if (!open) return;

        if (mode === 'edit' && subMenu) {
            form.setData({
                menu_id: subMenu.menu_id.toString(),
                title: subMenu.title,
                url: subMenu.url || '',
                feature_key: subMenu.feature_key || '',
                position: subMenu.position,
                is_active: subMenu.is_active,
            });
        } else {
            form.reset();
            form.clearErrors();
            form.setData({
                menu_id: '',
                title: '',
                url: '',
                feature_key: '',
                position: 0,
                is_active: true,
            });
        }

        setTouched({ title: false, menu_id: false });
    }, [open, mode, subMenu]);

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

    const validateMenu = (value: string) => {
        if (!value) {
            form.setError('menu_id', 'Please select a parent menu');
            return false;
        }
        form.clearErrors('menu_id');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isTitleValid = validateTitle(form.data.title);
        const isMenuValid = validateMenu(form.data.menu_id);

        if (!isTitleValid || !isMenuValid) {
            if (!isTitleValid) document.getElementById('title')?.focus();
            else document.getElementById('menu_id')?.focus();
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
            form.post(route('admin.sub-menus.store'), options);
        } else if (mode === 'edit' && subMenu) {
            form.put(route('admin.sub-menus.update', subMenu.id), options);
        }
    };

    const isSubmitDisabled =
        form.processing || !form.data.title.trim() || !form.data.menu_id;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Create Sub Menu'
                            : 'Edit Sub Menu'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new sub menu item'
                            : 'Modify existing sub menu item'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Parent Menu */}
                    <div className="space-y-2">
                        <Label htmlFor="menu_id">Parent Menu *</Label>
                        <Select
                            value={form.data.menu_id}
                            onValueChange={(v) => {
                                form.setData('menu_id', v);
                                if (touched.menu_id) validateMenu(v);
                            }}
                            disabled={form.processing}
                        >
                            <SelectTrigger
                                id="menu_id"
                                className={
                                    form.errors.menu_id && touched.menu_id
                                        ? 'border-destructive'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Select parent menu" />
                            </SelectTrigger>
                            <SelectContent>
                                {menus.map((m) => (
                                    <SelectItem
                                        key={m.id}
                                        value={m.id.toString()}
                                    >
                                        {m.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.menu_id && touched.menu_id && (
                            <p className="text-sm text-destructive">
                                {form.errors.menu_id}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g. About Us, Pricing, Blog"
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
                            placeholder="/about or /blog/post"
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
                            placeholder="e.g. blog, ecommerce, support"
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
                                  ? 'Create Sub Menu'
                                  : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
