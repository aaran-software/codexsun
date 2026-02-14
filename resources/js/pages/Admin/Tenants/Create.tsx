'use client';

import { Head, useForm } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import ListLayout from '@/components/table/ListLayout';
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
import { index as tenantRoutes } from '@/routes/admin/tenants/index';
import type { BreadcrumbItem } from '@/types';


export default function Create() {
    const route = useRoute();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        domain: '',
        industry: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tenants.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tenants', href: tenantRoutes().url },
        { title: 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tenant" />

            <ListLayout
                title="Create Tenant"
                description="Create a new tenant account"
            >
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
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
                            onChange={(e) => setData('slug', e.target.value)}
                        />
                        {errors.slug && (
                            <p className="text-sm text-red-500">
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    {/* Domain */}
                    <div className="space-y-2">
                        <Label>Domain</Label>
                        <Input
                            value={data.domain}
                            onChange={(e) => setData('domain', e.target.value)}
                        />
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                        <Label>Industry</Label>
                        <Input
                            value={data.industry}
                            onChange={(e) =>
                                setData('industry', e.target.value)
                            }
                        />
                    </div>

                    {/* Status */}
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

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            Create Tenant
                        </Button>
                    </div>
                </form>
            </ListLayout>
        </AppLayout>
    );
}
