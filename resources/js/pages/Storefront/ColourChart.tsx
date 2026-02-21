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

            <div className="min-h-screen bg-background text-foreground p-6">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-2">{tenant.name}</h1>
                        <p className="text-muted-foreground">slug: {tenant.slug}</p>
                        <p className="text-sm mt-1">
                            Current mode: <strong>{tenant.theme?.mode}</strong> |
                            Preset: <strong>{tenant.theme?.preset_name || 'None'}</strong>
                        </p>
                    </div>

                    {/* Preset buttons */}
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-4">Switch Preset</h2>
                        <div className="flex flex-wrap gap-3">
                            {themePresets.map(preset => {
                                const isActive = tenant.theme?.preset_id === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            router.post(route('theme.switch'), { preset_id: preset.id }, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                        disabled={isActive}
                                        className={`
                      px-5 py-2.5 rounded-lg border text-sm font-medium transition
                      ${isActive
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted hover:bg-muted/80 border-border'}
                    `}
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
                        <h2 className="text-2xl font-bold mb-6">
                            All Theme Variables ({variableEntries.length})
                        </h2>

                        {variableEntries.length === 0 ? (
                            <p className="text-muted-foreground">No variables received from backend</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {variableEntries
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                                        >
                                            <div className="font-mono text-sm break-all mb-2 text-primary">
                                                {key}
                                            </div>
                                            <div className="text-sm font-mono text-muted-foreground break-all">
                                                {value}
                                            </div>
                                            {value.startsWith('#') || value.startsWith('oklch') || value.includes('(') ? (
                                                <div
                                                    className="mt-3 w-full h-10 rounded border"
                                                    style={{ background: value }}
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
