// resources/js/pages/admin/tenants/Upsert.tsx
'use client';

import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface TenantFormData {
    name: string;
    display_name: string;
    tagline: string;
    slug: string;
    owner_id: string | number | null;
    is_active: boolean;
    is_suspended: boolean;
}

interface Props {
    tenant?: {
        id: number;
        name: string;
        display_name: string;
        tagline: string;
        slug: string;
        owner_id: number | null;
        is_active: boolean;
        is_suspended: boolean;
    };
    users: User[];
    isEdit?: boolean;
}

export default function TenantUpsert({ tenant = null, users, isEdit = false }: Props) {
    const route = useRoute();
    const { errors } = usePage().props;

    const { data, setData, post, put, processing } = useForm<TenantFormData>({
        name: tenant?.name || '',
        display_name: tenant?.display_name || '',
        tagline: tenant?.tagline || '',
        slug: tenant?.slug || '',
        owner_id: tenant?.owner_id || '',
        is_active: tenant?.is_active ?? true,
        is_suspended: tenant?.is_suspended ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && tenant?.id) {
            put(route('admin.tenants.update', tenant.id));
        } else {
            post(route('admin.tenants.store'));
        }
    };

    const title = isEdit ? 'Edit Tenant' : 'Create Tenant';
    const description = isEdit
        ? 'Update tenant information'
        : 'Create a new tenant account';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenants', href: route('admin.tenants.index') },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${title} Tenant`} />

            <div className="flex justify-center py-10">
                <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Company or organization name"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input
                                value={data.display_name}
                                onChange={(e) =>
                                    setData('display_name', e.target.value)
                                }
                                placeholder="Public facing name (optional)"
                            />
                        </div>

                        {/* Tagline */}
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                value={data.tagline}
                                onChange={(e) =>
                                    setData('tagline', e.target.value)
                                }
                                placeholder="Short catchy phrase (optional)"
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label>Slug *</Label>
                            <Input
                                value={data.slug}
                                onChange={(e) =>
                                    setData(
                                        'slug',
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/\s+/g, '-'),
                                    )
                                }
                                placeholder="unique-identifier"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs: yourdomain.com/tenants/
                                {data.slug || 'example'}
                            </p>
                            {errors.slug && (
                                <p className="text-sm text-destructive">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        {/* Owner */}
                        <div className="space-y-2">
                            <Label>Owner</Label>
                            <Select
                                value={data.owner_id?.toString() || ''}
                                onValueChange={(value) =>
                                    setData('owner_id', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select owner (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No owner</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id.toString()}
                                        >
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.owner_id && (
                                <p className="text-sm text-destructive">
                                    {errors.owner_id}
                                </p>
                            )}
                        </div>

                        {/* Status Toggles */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Active */}
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="is_active"
                                        className="text-base"
                                    >
                                        Active
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {data.is_active
                                            ? 'Tenant is live and accessible'
                                            : 'Tenant is disabled'}
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>

                            {/* Suspended */}
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="is_suspended"
                                        className="text-base"
                                    >
                                        Suspended
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {data.is_suspended
                                            ? 'Access blocked - emergency suspension'
                                            : 'Normal operation'}
                                    </p>
                                </div>
                                <Switch
                                    id="is_suspended"
                                    checked={data.is_suspended}
                                    onCheckedChange={(checked) =>
                                        setData('is_suspended', checked)
                                    }
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? isEdit
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : isEdit
                                      ? 'Update Tenant'
                                      : 'Create Tenant'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
