import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deploy',
        href: '/deploy',
    },
];

export default function Deploy() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const deploy = async () => {
        setLoading(true);
        setOutput(null);
        setError(null);

        try {
            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch('/deploy', {
                method: 'POST',
                credentials: 'same-origin', // 🔴 REQUIRED
                headers: {
                    'X-CSRF-TOKEN': token ?? '',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Deployment failed');
            }

            setOutput(data.output ?? ['Deploy completed successfully']);
        } catch (err: any) {
            setError(err.message ?? 'Deployment failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deploy" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Deploy Application"
                        description="Pull latest code, build assets, and clear cache"
                    />

                    {/* Deploy Button */}
                    <div>
                        <button
                            onClick={deploy}
                            disabled={loading}
                            className={`rounded-md px-4 py-2 text-white ${
                                loading
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? 'Deploying…' : 'Deploy Latest Update'}
                        </button>
                    </div>

                    {/* Error Output */}
                    {error && (
                        <pre className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </pre>
                    )}

                    {/* Deploy Output */}
                    {output && (
                        <pre className="max-h-96 overflow-auto rounded-md bg-black p-4 text-sm text-green-400">
                            {output.join('\n')}
                        </pre>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
