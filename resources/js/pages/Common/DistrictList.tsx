// resources/js/pages/Admin/District/Index.tsx
'use client';

import { usePage } from '@inertiajs/react';
import { EntityListPage } from '@/components/shared/EntityListPage';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Districts', href: '#' },
];

export default function DistrictIndex() {
    const { districts } = usePage().props as any;

    const columns = [
        {
            key: 'name',
            label: 'District Name',
        },
        {
            key: 'status',
            label: 'Status',
            render: (district: any) =>
                district.active_id === 1 ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
            visibleByDefault: true,
        },
    ];

    return (
        <EntityListPage
            entityName="District"
            entities={districts}
            routePrefix="districts"
            title="Districts"
            description="Manage districts for your application"
            placeholder="Search districts..."
            breadcrumbs={breadcrumbs}
            createLabel="New District"
            columns={columns}
            initialFormData={{ name: '', active_id: 1 }}
            formChildren={({ formData, setFormData, errors }) => (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">District Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter district name"
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
                                Is this district active and visible?
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
