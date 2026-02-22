'use client';

import { Link } from '@inertiajs/react';
import FadeUp from '@/components/blocks/animate/fade-up';
import { type LocationData } from '@/lib/tenant/types';

interface LocationProps {
    location?: LocationData | null;
}

export default function LocationSection({ location }: LocationProps) {
    if (!location) return null;

    const {
        displayName,
        title,
        address,
        timings,
        contact,
        buttonText,
        buttonHref,
        image,
        map,
    } = location;

    return (
        <section className="bg-white py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* LEFT CONTENT */}
                    <FadeUp>
                        <div>
                            <h2 className="mb-6 font-serif text-3xl text-gray-900 sm:text-4xl">
                                {title}
                            </h2>

                            <p className="mb-6 leading-relaxed text-gray-700">
                                <strong className="text-xl sm:text-4xl">
                                    {displayName}
                                </strong>
                                <br />
                                {address.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        <br />
                                    </span>
                                ))}
                            </p>

                            <div className="mb-6 space-y-1.5 text-sm text-gray-600">
                                {timings.map((time, index) => (
                                    <p key={index}>
                                        {time.day}: {time.hours}
                                    </p>
                                ))}
                            </div>

                            <div className="mb-8 space-y-1 text-sm text-gray-600">
                                <p>Phone: {contact.phone}</p>
                                <p>Email: {contact.email}</p>
                            </div>

                            <Link
                                href={buttonHref}
                                className="inline-block bg-black px-6 py-3 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-gray-800"
                            >
                                {buttonText}
                            </Link>
                        </div>
                    </FadeUp>

                    {/* RIGHT VISUAL */}
                    <FadeUp>
                        <div className="relative">
                            {/* Main Image */}
                            <img
                                src={image.src}
                                alt={image.alt}
                                className={image.className}
                                loading="lazy"
                            />

                            {/* Map Overlay */}
                            <div className="absolute -bottom-10 left-4 h-48 w-80 rounded bg-white p-2 shadow-2xl sm:-bottom-12 sm:left-8 sm:h-72 sm:w-114 sm:p-3">
                                <iframe
                                    title={map.title}
                                    src={map.embedUrl}
                                    className="h-full w-full rounded border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </div>
        </section>
    );
}
