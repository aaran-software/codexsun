'use client';

import FadeUp from '@/components/blocks/animate/fade-up';
import { type NewsletterData } from '@/lib/tenant/types';

interface NewsletterDataProps {
    newsletter?: NewsletterData | null;
}

export default function NewsletterSection({ newsletter }: NewsletterDataProps) {
    // Fallback values if newsletter data is missing
    const {
        title = 'Sign up for our Newsletter',
        description = 'Stay updated with the latest offers and insights.',
        placeholderName = 'Name',
        placeholderEmail = 'Email',
        buttonText = 'Subscribe',
        trustNote = 'We respect your privacy.',
        backgroundColor = '#F9D75C',
        buttonBg = 'bg-black',
        buttonHoverBg = 'hover:bg-gray-800',
        image = {
            src: '/assets/ttt/bags.png',
            alt: 'Newsletter Illustration',
            widthClass: 'w-32',
        },
    } = newsletter || {};

    return (
        <section
            className="relative overflow-hidden py-8"
            style={{ backgroundColor }}
        >
            {/* Top Visual Band */}
            {image?.src && (
                <div className="relative mb-3 flex h-30 w-auto justify-center md:mb-2">
                    <img
                        src={image.src}
                        alt={image.alt}
                        className={`${image.widthClass} object-contain opacity-90`}
                        loading="lazy"
                    />
                </div>
            )}

            <div className="relative z-10 container mx-auto px-4">
                <FadeUp>
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-6 text-3xl font-semibold text-gray-900 md:text-4xl">
                            {title}
                        </h2>

                        <p className="mb-12 text-sm leading-relaxed whitespace-pre-line text-gray-800 md:mb-14">
                            {description}
                        </p>

                        {/* Form */}
                        <form className="mb-10 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-2 md:gap-8">
                            <div className="text-left">
                                <label className="mb-1.5 block text-xs text-gray-800">
                                    {placeholderName}
                                </label>
                                <input
                                    type="text"
                                    // placeholder={placeholderName}
                                    className="w-full border-b-2 border-gray-900 bg-transparent py-2.5 text-gray-900 placeholder-gray-600 transition-colors focus:border-gray-700 focus:outline-none"
                                />
                            </div>

                            <div className="text-left">
                                <label className="mb-1.5 block text-xs text-gray-800">
                                    {placeholderEmail}
                                </label>
                                <input
                                    type="email"
                                    // placeholder={placeholderEmail}
                                    className="w-full border-b-2 border-gray-900 bg-transparent py-2.5 text-gray-900 placeholder-gray-600 transition-colors focus:border-gray-700 focus:outline-none"
                                />
                            </div>
                        </form>

                        <button
                            type="submit"
                            className={`inline-block ${buttonBg} cursor-pointer rounded-full px-8 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 sm:px-10 ${buttonHoverBg}`}
                        >
                            {buttonText}
                        </button>

                        {trustNote && (
                            <p className="mt-6 text-xs text-gray-700">
                                {trustNote}
                            </p>
                        )}
                    </div>
                </FadeUp>
            </div>
        </section>
    );
}
