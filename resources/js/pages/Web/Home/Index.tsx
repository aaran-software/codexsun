import { Head } from '@inertiajs/react';
import FullScreenSlider from '@/components/blocks/slider/FullScreenSlider';
import WebLayout from '@/layouts/web-layout';
import type { HomePageProps } from '@/lib/tenant/types';
import CatalogSection from '@/pages/Web/Home/blocks/CatalogSection';
import HeroSection from '@/pages/Web/Home/blocks/HeroSection';
import StatsSection from '@/pages/Web/Home/blocks/StatsSection';
import AboutSection from './blocks/AboutSection';

export default function Home({ abouts, hero, stats, catalog }: HomePageProps) {
    return (
        <WebLayout>
            <Head title="Home" />

            <FullScreenSlider />

            <HeroSection hero={hero} />
            <AboutSection abouts={abouts} />
            <StatsSection stats={stats} />
            <CatalogSection catalog={catalog} />

            {/*<div className="py-10">*/}
            {/*    <div className="mx-auto max-w-5xl px-4">*/}
            {/*        <div className="rounded-lg border bg-white p-6 shadow-sm">*/}
            {/*            <h1 className="mb-2 text-2xl font-semibold text-gray-900">*/}
            {/*                {message?.greetings ?? 'Welcome'}*/}
            {/*            </h1>*/}
            {/*            <div className="text-gray-600">*/}
            {/*                {message?.date ?? new Date().toLocaleString()}*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Optional debug - remove later */}
            {/*<pre className="mx-auto max-w-5xl overflow-auto rounded-xl bg-gray-900 p-6 text-sm text-green-300">*/}
            {/*    {JSON.stringify({ hero }, null, 2)}*/}
            {/*</pre>*/}
        </WebLayout>
    );
}
