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

import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
// import { index as tenantRoutes } from '@/routes/admin/tenants/index';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Create() {
    const route = useRoute();
    const { users } = usePage<{ users: User[] }>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        display_name:'',
        tagline:'',
        slug: '',
        owner_id: '',
        is_active: true,
        is_suspended: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tenants.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        // { title: 'Tenants', href: tenantRoutes().url },
        { title: 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tenant" />

            <div className="flex justify-center py-10">
                <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">
                            Create Tenant
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new tenant account
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

                        {/* display_name */}
                        <div className="space-y-2">
                            <Label>Display name</Label>
                            <Input
                                value={data.display_name}
                                onChange={(e) =>
                                    setData('display_name', e.target.value)
                                }
                            />
                        </div>

                        {/* tagline */}
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                value={data.tagline}
                                onChange={(e) =>
                                    setData('tagline', e.target.value)
                                }
                            />
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
                        <div className="w-full space-y-2">
                            <Label>Owner</Label>
                            <Select
                                value={data.owner_id?.toString()}
                                onValueChange={(value) =>
                                    setData('owner_id', value)
                                }
                            >
                                <SelectTrigger className="flex w-full">
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

                        {/* Suspended */}
                        <div className="space-y-2">
                            <Label>Suspended</Label>
                            <Select
                                value={data.is_suspended ? '1' : '0'}
                                onValueChange={(value) =>
                                    setData('is_suspended', value === '1')
                                }
                            >
                                <SelectTrigger className="flex w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No</SelectItem>
                                    <SelectItem value="1">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active Status</Label>
                                <p className="text-xs text-muted-foreground">
                                    {data.is_active
                                        ? 'Tenant can be accessed normally'
                                        : 'Tenant is currently disabled'}
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

                        {/*/!* Active Status *!/*/}
                        {/*<div className="space-y-2">*/}
                        {/*    <Label>Status</Label>*/}
                        {/*    <Select*/}
                        {/*        value={data.is_active ? '1' : '0'}*/}
                        {/*        onValueChange={(value) =>*/}
                        {/*            setData('is_active', value === '1')*/}
                        {/*        }*/}
                        {/*    >*/}
                        {/*        <SelectTrigger className="flex w-full">*/}
                        {/*            <SelectValue />*/}
                        {/*        </SelectTrigger>*/}
                        {/*        <SelectContent>*/}
                        {/*            <SelectItem value="1">Active</SelectItem>*/}
                        {/*            <SelectItem value="0">Inactive</SelectItem>*/}
                        {/*        </SelectContent>*/}
                        {/*    </Select>*/}
                        {/*</div>*/}

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
                                Create Tenant
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
