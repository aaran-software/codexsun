import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

type DeployAction =
    | 'full'
    | 'node'
    | 'npm'
    | 'update_build'
    | 'build';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Deploy', href: '/deploy' },
];

export default function Deploy() {
    const [loading, setLoading] = useState<DeployAction | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runDeploy = async (action: DeployAction) => {
        setLoading(action);
        setOutput(null);
        setError(null);

        try {
            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch('/deploy', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': token ?? '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            const text = await response.text();

            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text.slice(0, 300));
            }

            if (!response.ok) {
                throw new Error(data.message || 'Deployment failed');
            }

            setOutput(data.output || 'Deployment completed successfully');
        } catch (err: any) {
            setError(err.message || 'Deployment failed');
        } finally {
            setLoading(null);
        }
    };

    const DeployButton = ({
                              action,
                              label,
                          }: {
        action: DeployAction;
        label: string;
    }) => (
        <Button
            onClick={() => runDeploy(action)}
            disabled={loading !== null}
        >
            {loading === action ? 'Running…' : label}
        </Button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deploy" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Deploy Application"
                        description="Run deployment actions using Python"
                    />

                    <div className="grid gap-3 max-w-md">
                        <DeployButton action="full" label="1️⃣ Full installation" />
                        <DeployButton action="node" label="2️⃣ Install Node" />
                        <DeployButton action="npm" label="3️⃣ Install npm" />
                        <DeployButton action="update_build" label="4️⃣ Update & build" />
                        <DeployButton action="build" label="5️⃣ Only build" />
                    </div>

                    {output && (
                        <pre className="max-h-96 overflow-auto rounded-md bg-black p-4 text-sm text-green-400">
                            {output}
                        </pre>
                    )}

                    {error && (
                        <pre className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </pre>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
