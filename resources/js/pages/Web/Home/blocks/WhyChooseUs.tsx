'use client';

import {
    BadgeCheck,
    IndianRupee,
    Factory,
    Truck,
    ShieldCheck,
    Users,
    Laptop,
    Cpu,
    Network,
    Keyboard,
    Wrench,
    Shield,
    HardDrive,
    ClipboardCheck,
} from 'lucide-react';
import React from 'react';
import FadeUp from '@/components/blocks/animate/fade-up';
interface WhyChooseUsProps {
    whyChooseUs?: {
        heading: string;
        subheading: string;
        features: Array<{
            title: string;
            description: string;
            icon: string;
        }>;
    } | null;
}
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    BadgeCheck,
    IndianRupee,
    Factory,
    Truck,
    ShieldCheck,
    Users,
    Laptop,
    Cpu,
    Network,
    Keyboard,
    Wrench,
    Shield,
    HardDrive,
    ClipboardCheck,
};
export default function WhyChooseUs({ whyChooseUs }: WhyChooseUsProps) {
    if (!whyChooseUs || whyChooseUs.features.length === 0) return null;

    const { heading, subheading, features } = whyChooseUs;

    return (
        <section className="bg-gray-50 py-20 md:py-24 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <FadeUp>
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                            {heading}
                        </h2>
                        <p className="text-lg text-gray-600">{subheading}</p>
                    </div>
                </FadeUp>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = iconMap[feature.icon] || BadgeCheck;

                        return (
                            <FadeUp key={index} delay={index * 0.2}>
                                <div className="group h-full rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                                    {/* Icon */}
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/60 group-hover:text-white">
                                        <Icon className="h-7 w-7" />
                                    </div>

                                    {/* Text */}
                                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                        {feature.title}
                                    </h3>

                                    <p className="text-base leading-relaxed text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </FadeUp>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
