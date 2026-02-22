'use client';

import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ComponentType, SVGProps } from 'react';

interface FooterBrandProps {
    companyName: string;
    tagline: string;
    LogoComponent: ComponentType<SVGProps<SVGSVGElement> | { className?: string }>;
    logoProps?: {
        className?: string;
        [key: string]: unknown;
    };
}

export default function FooterBrand({
                                        companyName,
                                        tagline,
                                        LogoComponent,
                                        logoProps = {},
                                    }: FooterBrandProps) {
    return (
        <div>
            <div className="mb-4 flex items-center gap-3">
                <Link href="/">
                    <div className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
                        <LogoComponent
                            {...logoProps}
                            className={clsx(
                                'h-7 w-auto transition-all duration-300 sm:h-8 md:h-9',
                                'text-white',
                                logoProps?.className,
                            )}
                        />
                        <span
                            className={clsx(
                                'font-bold tracking-tight transition-all duration-300',
                                'text-xl sm:text-2xl md:text-2.5xl lg:text-3xl',
                                'text-white',
                            )}
                        >
              {companyName}
            </span>
                    </div>
                </Link>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">
                {tagline}
            </p>
        </div>
    );
}
