'use client';

import { Link } from '@inertiajs/react';
import type { CallToActionData } from '@/lib/tenant/types';

interface CallToActionPros {
    CallToAction?: CallToActionData;
}
export default function CallToAction({ CallToAction }: CallToActionPros) {
    if (!CallToAction) return null;

    const {
        backgroundColor,
        title,
        description,
        buttonText,
        buttonHref,
        buttonBg,
        buttonTextColor,
        buttonHoverBg = 'hover:opacity-90',
    } = CallToAction;

    return (
        <section className="py-16 text-white" style={{ backgroundColor }}>
            <div className="container mx-auto px-4 text-center">
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
                    {title}
                </h2>

                <p className="mx-auto mb-6 max-w-2xl whitespace-pre-line text-gray-300">
                    {description}
                </p>

                <Link
                    href={buttonHref}
                    className={`inline-block rounded px-6 py-3 font-medium transition ${buttonBg} ${buttonTextColor} ${buttonHoverBg} `}
                >
                    {buttonText}
                </Link>
            </div>
        </section>
    );
}
