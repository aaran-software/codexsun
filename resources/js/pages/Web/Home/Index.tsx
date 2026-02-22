import { Head } from '@inertiajs/react';
import FullScreenSlider from '@/components/blocks/slider/FullScreenSlider';
import WebLayout from '@/layouts/web-layout';
import type { HomePageProps } from '@/lib/tenant/types';
import AboutSection from './blocks/AboutSection';

export default function Home({ message, abouts }: HomePageProps) {
    return (
        <WebLayout>
            <Head title="Home" />

            <FullScreenSlider />

            <AboutSection abouts={abouts} />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                            {message?.greetings ?? 'Welcome'}
                        </h1>
                        <div className="text-gray-600">
                            {message?.date ?? new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional debug - remove later */}
            <pre className="bg-gray-900 text-green-300 p-6 rounded-xl overflow-auto max-w-5xl mx-auto text-sm">
                {JSON.stringify({ abouts }, null, 2)}
            </pre>
        </WebLayout>
    );
}
