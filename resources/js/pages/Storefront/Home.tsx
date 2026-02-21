import { Head, router, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import WebLayout from '@/layouts/web-layout';

interface Theme {
    mode: 'light' | 'dark';
    variables?: Record<string, string>;
}

interface Feature {
    store: boolean;
    blog: boolean;
    chat: boolean;
    analytics: boolean;
}

interface Setting {
    logo: string | null;
    email?: string | null;
}

interface Tenant {
    name: string;
    slug: string;
    theme?: Theme;
    feature?: Feature;
    setting?: Setting;
}

export default function Home() {
    const { tenant, themePresets } = usePage().props as unknown as {
        tenant: Tenant;
        themePresets: { id: number; name: string }[];
    };
    const route = useRoute();
    const variables = tenant.theme?.variables ?? {};
    const firstFive = Object.entries(variables).slice(0, 5);

    return (
        <>
            <WebLayout>
                <Head>
                    <title>{tenant.name}</title>
                    <meta
                        name="description"
                        content={`Welcome to ${tenant.name}`}
                    />
                </Head>

                <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
                        {/* Logo */}
                        {tenant.setting?.logo && (
                            <img
                                src={tenant.setting.logo}
                                alt={tenant.name}
                                className="mb-6 h-20 object-contain"
                            />
                        )}

                        {/* Title */}
                        <h1 className="mb-4 text-5xl font-bold tracking-tight">
                            {tenant.name}
                        </h1>

                        <p className="mb-10 max-w-xl text-muted-foreground">
                            This is the public storefront for{' '}
                            <strong>{tenant.slug}</strong>.
                        </p>

                        {/* Preset Switch */}
                        <div className="rounded-lg border border-border p-4 md:col-span-2">
                            <div className="mb-2 text-sm text-muted-foreground">
                                Switch Preset
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {themePresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() =>
                                            router.post(
                                                route('theme.switch'),
                                                { preset_id: preset.id },
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        className="rounded-md border border-border bg-muted px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ===============================
                            THEME SETTINGS DISPLAY
                        =============================== */}

                        <div className="mb-12 w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow">
                            <h2 className="mb-6 text-xl font-semibold">
                                Theme Settings
                            </h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Mode */}
                                <div className="rounded-lg border border-border bg-muted p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mode
                                    </div>
                                    <div className="mt-1 font-medium capitalize">
                                        {tenant.theme?.mode ?? 'light'}
                                    </div>
                                </div>

                                {/* Primary Preview */}
                                <div className="rounded-lg border border-border p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Primary Color
                                    </div>
                                    <div
                                        className="mt-3 h-10 w-full rounded-md"
                                        style={{ background: 'var(--primary)' }}
                                    />
                                </div>

                                {/* Secondary Preview */}
                                <div className="rounded-lg border border-border p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Secondary Color
                                    </div>
                                    <div
                                        className="mt-3 h-10 w-full rounded-md"
                                        style={{
                                            background: 'var(--secondary)',
                                        }}
                                    />
                                </div>

                                {/* Radius */}
                                <div className="rounded-lg border border-border bg-muted p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Radius
                                    </div>
                                    <div className="mt-1 font-medium">
                                        {variables['--radius'] ?? '0.5rem'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===============================
                            FIRST FIVE VARIABLES
                        =============================== */}

                        <div className="mb-12 w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow">
                            <h2 className="mb-6 text-xl font-semibold">
                                First 5 Theme Variables
                            </h2>

                            <div className="space-y-4 text-left">
                                {firstFive.map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-md border border-border bg-muted p-3"
                                    >
                                        <span className="font-mono text-sm">
                                            {key}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-6 w-6 rounded border"
                                                style={{ background: value }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ===============================
                            BUTTON VARIANTS
                        =============================== */}

                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="rounded-(--radius) bg-primary px-6 py-3 text-primary-foreground shadow transition hover:opacity-90">
                                Primary
                            </button>

                            <button className="rounded-(--radius) bg-secondary px-6 py-3 text-secondary-foreground shadow transition hover:opacity-90">
                                Secondary
                            </button>

                            <button className="rounded-(--radius) border border-border bg-transparent px-6 py-3 text-foreground transition hover:bg-muted">
                                Outline
                            </button>

                            <button className="rounded-(--radius) px-6 py-3 text-foreground transition hover:bg-muted">
                                Ghost
                            </button>

                            <button className="rounded-(--radius) bg-destructive px-6 py-3 text-destructive-foreground shadow transition hover:opacity-90">
                                Destructive
                            </button>

                            <button className="text-primary underline-offset-4 transition hover:underline">
                                Link
                            </button>
                        </div>

                        <div className="mt-16 text-xs text-muted-foreground">
                            Powered by CODEXSUN Multi-Tenant Engine
                        </div>
                    </div>
                </div>
            </WebLayout>
        </>
    );
}
