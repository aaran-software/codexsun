import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Action = 'full' | 'node' | 'npm' | 'update_build' | 'build';

export default function Deploy() {
    const [loading, setLoading] = useState<Action | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = async (action: Action) => {
        setLoading(action);
        setOutput(null);
        setError(null);

        try {
            const res = await fetch('/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')!
                        .getAttribute('content')!,
                },
                body: JSON.stringify({ action }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Deploy failed');

            setOutput(data.output);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(null);
        }
    };

    const Button = ({ action, label }: { action: Action; label: string }) => (
        <button
            onClick={() => run(action)}
            disabled={loading !== null}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
            {loading === action ? 'Running…' : label}
        </button>
    );

    return (
        <>
            <Head title="Deploy" />

            <div className="space-y-4">
                <h1 className="text-xl font-bold">Deployment</h1>

                <div className="grid gap-3">
                    <Button action="full" label="1️⃣ Full installation" />
                    <Button action="node" label="2️⃣ Install Node" />
                    <Button action="npm" label="3️⃣ Install npm" />
                    <Button action="update_build" label="4️⃣ Update & build" />
                    <Button action="build" label="5️⃣ Only build" />
                </div>

                {output && (
                    <pre className="mt-4 overflow-auto bg-gray-100 p-3 text-sm">
                        {output}
                    </pre>
                )}

                {error && <div className="mt-2 text-red-600">{error}</div>}
            </div>
        </>
    );
}
