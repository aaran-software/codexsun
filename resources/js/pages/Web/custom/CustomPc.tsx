// resources/js/pages/web/custom/CustomPc.tsx

'use client';

import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WebLayout from '@/layouts/web-layout';
import type { CustomPcData } from '@/lib/tenant/custom-pc.types';

interface Props {
    customPc?: CustomPcData | null;
}

export default function CustomPc({ customPc }: Props) {
    if (!customPc) return null;

    const { heading, subheading, components } = customPc;

    return (
        <WebLayout>
            <Head title="Custom PC Builder - Tech Media Retail" />

            <section className="bg-linear-to-b from-slate-50 to-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
                            {heading}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
                            {subheading}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Object.entries(components).map(([category, items]) => (
                            <Card
                                key={category}
                                className="group overflow-hidden transition-all hover:shadow-xl"
                            >
                                <div className="flex h-48 items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600">
                                    <span className="text-6xl font-bold tracking-widest text-white/30 uppercase">
                                        {category}
                                    </span>
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-2xl capitalize">
                                        {category.replace(/([A-Z])/g, ' $1')}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">
                                        {items.length} options available
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <Button className="w-full" asChild>
                                        <a
                                            href={`/custom-pc/builder?category=${category}`}
                                        >
                                            Browse {category.toUpperCase()}{' '}
                                            Options
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </WebLayout>
    );
}
