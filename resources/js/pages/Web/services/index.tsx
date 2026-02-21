// resources/js/pages/web/services/index.tsx

'use client';

import { Button } from '@base-ui/react';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import FadeUp from '@/components/animate/fade-up';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import WebLayout from '@/layouts/web-layout';
import { useCurrentTenant } from '@/lib/tenant';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';

export default function ServicesPage() {
    const { services } = useCurrentTenant();

    if (!services) return null;

    const { heading, subheading, description, backgroundColor, sections } =
        services;

    return (
        <WebLayout>
            <Head title="Services" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Services"
                subtitle="End-to-End Technology."
            />

            {/* Hero */}
            <section
                className="relative py-24 md:py-32"
                style={{ backgroundColor: backgroundColor || '#ffffff' }}
            >
                <div className="container mx-auto px-6 text-center">
                    <FadeUp>
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                            {heading}
                        </h1>
                    </FadeUp>

                    {subheading && (
                        <FadeUp delay={0.2}>
                            <p className="mx-auto mt-6 max-w-5xl text-2xl text-gray-700 md:text-3xl">
                                {subheading}
                            </p>
                        </FadeUp>
                    )}

                    {description && (
                        <FadeUp delay={0.3}>
                            <p className="mx-auto mt-8 max-w-4xl text-lg text-gray-600 md:text-xl">
                                {description}
                            </p>
                        </FadeUp>
                    )}
                </div>
            </section>

            {/* Dynamic Sections – each section has its own heading + any number of items */}
            {sections.map((section, sectionIndex) => (
                <section
                    key={section.title}
                    className="py-16 md:py-24"
                    style={{
                        backgroundColor: section.backgroundColor || '#f8fafc',
                    }}
                >
                    <div className="container mx-auto px-6">
                        <FadeUp>
                            <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 md:text-5xl">
                                {section.title}
                            </h2>
                        </FadeUp>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {section.items.map((item, itemIndex) => {
                                const Icon = item.icon
                                    ? (LucideIcons[
                                          item.icon as keyof typeof LucideIcons
                                      ] as LucideIcon)
                                    : null;

                                return (
                                    <FadeUp
                                        key={item.title}
                                        delay={
                                            (sectionIndex + itemIndex) * 0.08
                                        }
                                    >
                                        <Card className="group h-full border-t-4 border-blue-600 transition-all hover:shadow-2xl">
                                            <CardHeader>
                                                {Icon && (
                                                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                        <Icon size={32} />
                                                    </div>
                                                )}
                                                <CardTitle className="text-2xl">
                                                    {item.title}
                                                </CardTitle>
                                                <CardDescription className="text-base">
                                                    {item.description}
                                                </CardDescription>
                                            </CardHeader>

                                            {item.features &&
                                                item.features.length > 0 && (
                                                    <CardContent>
                                                        <ul className="space-y-3">
                                                            {item.features.map(
                                                                (
                                                                    feature,
                                                                    fi,
                                                                ) => (
                                                                    <li
                                                                        key={fi}
                                                                        className="flex items-start gap-3"
                                                                    >
                                                                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                                                        <span className="text-gray-700">
                                                                            {
                                                                                feature
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </CardContent>
                                                )}

                                            {item.link && (
                                                <CardFooter>
                                                    <Button className="w-full">
                                                        <a href={item.link}>
                                                            Learn More →
                                                        </a>
                                                    </Button>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    </FadeUp>
                                );
                            })}
                        </div>
                    </div>
                </section>
            ))}
        </WebLayout>
    );
}
