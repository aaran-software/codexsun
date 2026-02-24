// resources/js/Pages/Admin/MenuGroups/MenuGroupFormModal.tsx
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

import type { MenuGroup } from './types';

type ModalMode = 'create' | 'edit' | null;

interface MenuGroupFormModalProps {
    open: boolean;
    mode: ModalMode;
    group: MenuGroup | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function MenuGroupFormModal({
    open,
    mode,
    group,
    onClose,
    onSuccess,
}: MenuGroupFormModalProps) {
    const route = useRoute();

    const form = useForm({
        name: '',
        location: '',
        is_active: true,
    });

    // Track which fields have been touched (for showing errors only after interaction)
    const [touched, setTouched] = useState({
        name: false,
        location: false,
    });

    // Fill form when editing / reset when creating
    useEffect(() => {
        if (!open) return;

        if (mode === 'edit' && group) {
            form.setData({
                name: group.name,
                location: group.location || '',
                is_active: group.is_active,
            });
        } else if (mode === 'create') {
            form.reset();
            form.clearErrors();
            form.setData({
                name: '',
                location: '',
                is_active: true,
            });
        }

        // Reset touched state when modal opens
        setTouched({ name: false, location: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, group]);

    // Manual validation rules (client-side mirror of backend)
    const validateField = (field: 'name' | 'location', value: string) => {
        if (field === 'name') {
            if (!value.trim()) {
                form.setError('name', 'Group name is required');
            } else if (value.length > 100) {
                form.setError('name', 'Name cannot exceed 100 characters');
            } else {
                form.clearErrors('name');
            }
        }

        if (field === 'location') {
            if (
                value &&
                !['header', 'footer', 'sidebar', 'mobile', 'other'].includes(
                    value,
                )
            ) {
                form.setError('location', 'Invalid location selected');
            } else {
                form.clearErrors('location');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation before submit
        validateField('name', form.data.name);
        validateField('location', form.data.location);

        if (form.hasErrors) {
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
            form.post(route('admin.menu-groups.store'), options);
        } else if (mode === 'edit' && group) {
            form.put(route('admin.menu-groups.update', group.id), options);
        }
    };

    const isFormValid = !form.hasErrors && form.data.name.trim() !== '';

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset();
                    form.clearErrors();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Create Menu Group'
                            : 'Edit Menu Group'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new menu group (e.g. Main Navigation, Footer Links)'
                            : 'Update the menu group details'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Header Menu, Footer Links"
                            value={form.data.name}
                            onChange={(e) => {
                                form.setData('name', e.target.value);
                                if (touched.name)
                                    validateField('name', e.target.value);
                            }}
                            onBlur={() => {
                                setTouched((prev) => ({ ...prev, name: true }));
                                validateField('name', form.data.name);
                            }}
                            disabled={form.processing}
                            autoFocus
                            className={
                                form.errors.name
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                        />
                        {form.errors.name && touched.name && (
                            <p className="text-sm text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select
                            value={form.data.location}
                            onValueChange={(value) => {
                                form.setData('location', value);
                                if (touched.location)
                                    validateField('location', value);
                            }}
                            disabled={form.processing}
                        >
                            <SelectTrigger
                                id="location"
                                className={
                                    form.errors.location
                                        ? 'border-destructive focus-visible:ring-destructive'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="None / Custom (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="mobile">
                                    Mobile Menu
                                </SelectItem>
                                <SelectItem value="other">
                                    Other / Custom
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {form.errors.location && touched.location && (
                            <p className="text-sm text-destructive">
                                {form.errors.location}
                            </p>
                        )}
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive groups will not appear in menu builders
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

                    {/* Buttons */}
                    <DialogFooter className="gap-3 pt-4 sm:gap-4">
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
                            disabled={form.processing || !isFormValid}
                            className={
                                !isFormValid
                                    ? 'cursor-not-allowed opacity-70'
                                    : ''
                            }
                        >
                            {form.processing
                                ? 'Saving...'
                                : mode === 'create'
                                  ? 'Create Group'
                                  : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
