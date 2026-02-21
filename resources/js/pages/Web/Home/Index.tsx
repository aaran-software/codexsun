import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import type { HomePageProps } from '@/types/web';

export default function Home({ message }: HomePageProps) {
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
