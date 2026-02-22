import { Head, router, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import WebLayout from '@/layouts/web-layout';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    theme: {
        mode: 'light' | 'dark';
        preset_id: number | null;
        preset_name: string | null;
        variables: Record<string, string>;
    };
}

interface Preset {
    id: number;
    name: string;
}

export default function Home() {
    const { tenant, themePresets } = usePage().props as unknown as {
        tenant: Tenant;
        themePresets: Preset[];
    };

    const route = useRoute();

    const variables = tenant.theme?.variables ?? {};
    const variableEntries = Object.entries(variables);

    return (
        <WebLayout>
            <Head title={tenant.name} />

            <div className="min-h-screen bg-background p-6 text-foreground">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-2 text-4xl font-bold">
                            {tenant.name}
                        </h1>
                        <p className="text-muted-foreground">
                            slug: {tenant.slug}
                        </p>
                        <p className="mt-1 text-sm">
                            Current mode: <strong>{tenant.theme?.mode}</strong>{' '}
                            | Preset:{' '}
                            <strong>
                                {tenant.theme?.preset_name || 'None'}
                            </strong>
                        </p>
                    </div>

                    {/* Preset buttons */}
                    <div className="mb-12">
                        <h2 className="mb-4 text-xl font-semibold">
                            Switch Preset
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {themePresets.map((preset) => {
                                const isActive =
                                    tenant.theme?.preset_id === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            router.post(
                                                route('theme.switch'),
                                                { preset_id: preset.id },
                                                {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                },
                                            );
                                        }}
                                        disabled={isActive}
                                        className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-muted hover:bg-muted/80'
                                        } `}
                                    >
                                        {preset.name}
                                        {isActive && ' ✓'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* All variables - simple list */}
                    <div>
                        <h2 className="mb-6 text-2xl font-bold">
                            All Theme Variables ({variableEntries.length})
                        </h2>

                        {variableEntries.length === 0 ? (
                            <p className="text-muted-foreground">
                                No variables received from backend
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {variableEntries
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                                        >
                                            <div className="mb-2 font-mono text-sm break-all text-primary">
                                                {key}
                                            </div>
                                            <div className="font-mono text-sm break-all text-muted-foreground">
                                                {value}
                                            </div>
                                            {value.startsWith('#') ||
                                            value.startsWith('oklch') ||
                                            value.includes('(') ? (
                                                <div
                                                    className="mt-3 h-10 w-full rounded border"
                                                    style={{
                                                        background: value,
                                                    }}
                                                />
                                            ) : null}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-16 text-center text-sm text-muted-foreground">
                        Powered by CODEXSUN Multi-Tenant Engine
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}
