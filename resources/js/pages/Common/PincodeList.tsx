'use client';

import { usePage } from '@inertiajs/react';
import { EntityListPage } from '@/components/shared/EntityListPage';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Pincodes', href: '#' },
];

export default function PincodeList() {
    const { pincodes } = usePage().props as any;

    const columns = [
        {
            key: 'name',
            label: 'PIN Code',
        },
        {
            key: 'status',
            label: 'Status',
            render: (pincode: any) =>
                pincode.active_id === 1 ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
            visibleByDefault: true,
        },
    ];

    return (
        <EntityListPage
            entityName="PIN Code"
            entities={pincodes}
            routePrefix="pincodes"
            title="PIN Codes"
            description="Manage postal index numbers (India)"
            placeholder="Search PIN codes..."
            breadcrumbs={breadcrumbs}
            columns={columns}
            initialFormData={{ name: '', active_id: 1 }}
            formChildren={({ formData, setFormData, errors }) => (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">PIN Code</Label>
                        <Input
                            id="name"
                            placeholder="600001, 560001, ..."
                            maxLength={6}
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Is this PIN code active and visible?
                            </p>
                        </div>
                        <Switch
                            id="active"
                            checked={formData.active_id === 1}
                            onCheckedChange={(checked) =>
                                setFormData({
                                    ...formData,
                                    active_id: checked ? 1 : 0,
                                })
                            }
                        />
                    </div>
                </div>
            )}
        />
    );
}
