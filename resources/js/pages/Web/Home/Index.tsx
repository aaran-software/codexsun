// resources/js/pages/Home.tsx
import { Head, usePage } from '@inertiajs/react';
import type { HomePageProps  } from '@/types/web';
import WebLayout from '@/layouts/web-layout';

export default function Home() {
    const { message } = usePage<HomePageProps>().props;

    return (
        <WebLayout>
            <Head title="Home" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="rounded-lg border bg-white p-6">
                        <h1 className="mb-2 text-2xl font-semibold">
                            {message?.greetings ?? 'Welcome'}
                        </h1>
                        <div className="text-gray-600">
                            {message?.date ?? new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}
