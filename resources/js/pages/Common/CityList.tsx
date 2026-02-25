// resources/js/pages/Admin/City/Index.tsx
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
    { title: 'Cities', href: '#' },
];

export default function CitiesIndex() {
    const { cities } = usePage().props as any;

    const columns = [
        {
            key: 'name',
            label: 'City Name',
        },
        {
            key: 'status',
            label: 'Status',
            render: (city: any) =>
                city.active_id === 1 ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
            visibleByDefault: true,
        },
    ];

    return (
        <EntityListPage
            entityName="City"
            entities={cities}
            routePrefix="cities"
            title="Cities"
            description="Manage cities for your application"
            placeholder="Search cities..."
            breadcrumbs={breadcrumbs}
            columns={columns}
            initialFormData={{ name: '', active_id: 1 }}
            formChildren={({ formData, setFormData, errors }) => (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">City Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter city name"
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
                                Is this city active and visible?
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
