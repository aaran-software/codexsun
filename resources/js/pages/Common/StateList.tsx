// resources/js/pages/Common/StateList.tsx
'use client';

import { usePage } from '@inertiajs/react';
import { EntityListPage } from '@/components/shared/EntityListPage';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'States', href: '#' },
];

export default function StateList() {
    const { states } = usePage().props as any;

    const columns = [
        { key: 'name', label: 'State Name' },
        { key: 'state_code', label: 'State Code' },
        {
            key: 'status',
            label: 'Status',
            render: (s: any) =>
                s.active_id === 1 ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
            visibleByDefault: true,
        },
    ];

    return (
        <EntityListPage
            entityName="State"
            entities={states}
            routePrefix="states"
            title="States"
            description="Manage Indian states"
            placeholder="Search states or codes..."
            breadcrumbs={breadcrumbs}
            columns={columns}
            initialFormData={{ name: '', state_code: '', active_id: 1 }}
            formChildren={({ formData, setFormData, errors }) => (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">State Name</Label>
                            <Input
                                id="name"
                                placeholder="Tamil Nadu"
                                value={formData.name}
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
                        <div className="space-y-2">
                            <Label htmlFor="state_code">State Code</Label>
                            <Input
                                id="state_code"
                                placeholder="TN"
                                maxLength={5}
                                value={formData.state_code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        state_code:
                                            e.target.value.toUpperCase(),
                                    })
                                }
                            />
                            {errors.state_code && (
                                <p className="text-sm text-red-600">
                                    {errors.state_code}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Is this state active?
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
