'use client';

import { Head, useForm, usePage } from '@inertiajs/react';
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

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { index as tenantRoutes } from '@/routes/admin/tenants/index';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    owner_id: number | null;
    is_active: boolean;
    is_suspended: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Edit() {
    const route = useRoute();
    const { tenant, users } = usePage<{
        tenant: Tenant;
        users: User[];
    }>().props;

    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name ?? '',
        slug: tenant.slug ?? '',
        owner_id: tenant.owner_id?.toString() ?? '',
        is_active: tenant.is_active ?? true,
        is_suspended: tenant.is_suspended ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.tenants.update', tenant.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenants', href: tenantRoutes().url },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tenant" />

            <div className="flex justify-center py-10">
                <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Edit Tenant</h1>
                        <p className="text-sm text-muted-foreground">
                            Update tenant information
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                            />
                            {errors.slug && (
                                <p className="text-sm text-red-500">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        {/* Owner Lookup */}
                        <div className="space-y-2">
                            <Label>Owner</Label>
                            <Select
                                value={data.owner_id?.toString()}
                                onValueChange={(value) =>
                                    setData('owner_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select owner" />
                                </SelectTrigger>

                                <SelectContent>
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
                                <p className="text-sm text-red-500">
                                    {errors.owner_id}
                                </p>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={data.is_active ? '1' : '0'}
                                onValueChange={(value) =>
                                    setData('is_active', value === '1')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Suspended */}
                        <div className="space-y-2">
                            <Label>Suspended</Label>
                            <Select
                                value={data.is_suspended ? '1' : '0'}
                                onValueChange={(value) =>
                                    setData('is_suspended', value === '1')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No</SelectItem>
                                    <SelectItem value="1">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={processing}>
                                Update Tenant
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
