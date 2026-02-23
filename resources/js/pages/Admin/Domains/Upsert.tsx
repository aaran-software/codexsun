// resources/js/pages/admin/domains/Upsert.tsx
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

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface TenantOption {
    id: number;
    name: string;
}

interface DomainFormData {
    tenant_id: string | number | null;
    domain: string;
    force_https: boolean;
    is_primary: boolean;
    is_active: boolean;
}

interface Props {
    domain?: {
        id: number;
        tenant_id: number | null;
        domain: string;
        force_https: boolean;
        is_primary: boolean;
        is_active: boolean;
    };
    tenants: TenantOption[];
    isEdit?: boolean;
}

export default function DomainUpsert({
    domain = null,
    tenants,
    isEdit = false,
}: Props) {
    const route = useRoute();
    const { errors } = usePage().props;

    const { data, setData, post, put, processing } = useForm<DomainFormData>({
        tenant_id: domain?.tenant_id || '',
        domain: domain?.domain || '',
        force_https: domain?.force_https ?? true,
        is_primary: domain?.is_primary ?? false,
        is_active: domain?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && domain?.id) {
            put(route('admin.domains.update', domain.id));
        } else {
            post(route('admin.domains.store'));
        }
    };

    const title = isEdit ? 'Edit Domain' : 'Add Domain';
    const description = isEdit
        ? 'Update domain settings and assignment'
        : 'Link a new domain to a tenant';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Domains', href: route('admin.domains.index') },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${title} Domain`} />

            <div className="flex justify-center py-10">
                <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Tenant */}
                        <div className="space-y-2">
                            <Label>Tenant *</Label>
                            <Select
                                value={data.tenant_id?.toString() || ''}
                                onValueChange={(value) =>
                                    setData('tenant_id', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((tenant) => (
                                        <SelectItem
                                            key={tenant.id}
                                            value={tenant.id.toString()}
                                        >
                                            {tenant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tenant_id && (
                                <p className="text-sm text-destructive">
                                    {errors.tenant_id}
                                </p>
                            )}
                        </div>

                        {/* Domain */}
                        <div className="space-y-2">
                            <Label>Domain Name *</Label>
                            <Input
                                value={data.domain}
                                onChange={(e) =>
                                    setData(
                                        'domain',
                                        e.target.value.toLowerCase().trim(),
                                    )
                                }
                                placeholder="example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                Full domain without http/https or www (will be
                                normalized)
                            </p>
                            {errors.domain && (
                                <p className="text-sm text-destructive">
                                    {errors.domain}
                                </p>
                            )}
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {/* Force HTTPS */}
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="force_https"
                                        className="text-base"
                                    >
                                        Force HTTPS
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Redirect all traffic to HTTPS
                                    </p>
                                </div>
                                <Switch
                                    id="force_https"
                                    checked={data.force_https}
                                    onCheckedChange={(checked) =>
                                        setData('force_https', checked)
                                    }
                                />
                            </div>

                            {/* Primary Domain */}
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="is_primary"
                                        className="text-base"
                                    >
                                        Primary Domain
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Main domain for this tenant
                                    </p>
                                </div>
                                <Switch
                                    id="is_primary"
                                    checked={data.is_primary}
                                    onCheckedChange={(checked) =>
                                        setData('is_primary', checked)
                                    }
                                />
                            </div>

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
                                            ? 'Domain is usable'
                                            : 'Domain disabled'}
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
                                      ? 'Update Domain'
                                      : 'Add Domain'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
