// resources/js/pages/Common/CountryList.tsx
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
    { title: 'Countries', href: '#' },
];

export default function CountryList() {
    const { countries } = usePage().props as any;

    const columns = [
        {
            key: 'name',
            label: 'Country Name',
        },
        {
            key: 'country_code',
            label: 'Country Code',
        },
        {
            key: 'currency_symbol',
            label: 'Currency Symbol',
        },
        {
            key: 'status',
            label: 'Status',
            render: (country: any) =>
                country.active_id === 1 ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
            visibleByDefault: true,
        },
    ];

    return (
        <EntityListPage
            entityName="Country"
            entities={countries}
            routePrefix="countries"
            title="Countries"
            description="Manage countries"
            placeholder="Search countries or codes..."
            breadcrumbs={breadcrumbs}
            columns={columns}
            initialFormData={{
                name: '',
                country_code: '',
                currency_symbol: '',
                active_id: 1,
            }}
            formChildren={({ formData, setFormData, errors }) => (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Country Name</Label>
                            <Input
                                id="name"
                                placeholder="India, United States, Singapore, ..."
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

                        <div className="space-y-2">
                            <Label htmlFor="country_code">
                                Country Code (ISO)
                            </Label>
                            <Input
                                id="country_code"
                                placeholder="IN, US, SG, ..."
                                maxLength={3}
                                value={formData.country_code || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        country_code:
                                            e.target.value.toUpperCase(),
                                    })
                                }
                            />
                            {errors.country_code && (
                                <p className="text-sm text-red-600">
                                    {errors.country_code}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="currency_symbol">
                                Currency Symbol
                            </Label>
                            <Input
                                id="currency_symbol"
                                placeholder="₹, $, €, £, ¥, ..."
                                maxLength={10}
                                value={formData.currency_symbol || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        currency_symbol: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Is this country active and visible?
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
