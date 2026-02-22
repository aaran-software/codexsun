'use client';

import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import React from 'react';
import { TenantLogo } from '@/components/blocks/logo/tenant-logo';
import type { CompanyData } from '@/lib/tenant/types';
import { type FooterData  } from '@/lib/tenant/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
};

interface FooterProps {
    footer?: FooterData | null;
    company?: CompanyData;
}

export default function FooterSection({
    footer,
    company,
}: FooterProps) {
    if (!footer?.sections?.length || !company) return null;

    const {
        name = 'Tech Media Retail',
        displayName,
        tagline,
        address1 = '',
        address2 = '',
        city = '',
        state = '',
        pinCode = '',
        gstin = '',
        mobile1 = '',
        email = '',
    } = company;

    const { sections, social } = footer;

    return (
        <footer className="bg-gray-950 text-gray-300">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {/* Brand & Contact Column */}
                    <div className="lg:col-span-2">
                        <div className="mt-4">
                            <div className={"flex gap-1 items-center"}>
                                <TenantLogo
                                    className={`h-8 w-auto transition-colors duration-300`}
                                />
                                <h3 className="text-2xl font-semibold text-white">
                                    {displayName || name}
                                </h3>
                            </div>
                            {tagline && (
                                <p className="mt-1 text-sm text-gray-400">
                                    {tagline}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 space-y-1.5 text-sm text-gray-400">
                            {(address1 || city) && (
                                <p>
                                    {address1} {address2}
                                    <br />
                                    {city}, {state} {pinCode}
                                </p>
                            )}
                            {gstin && <p>GSTIN: {gstin}</p>}
                            {mobile1 && <p>{mobile1}</p>}
                            {email && <p>{email}</p>}
                        </div>
                    </div>

                    {/* Dynamic Footer Link Columns */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-200 uppercase">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Social Icons + Copyright */}
                <div className="mt-16 border-t border-gray-800 pt-8">
                    <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                        <div className="flex gap-2">
                            {social?.map((item) => {
                                const Icon = iconMap[item.Icon] || Facebook;
                                return (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full bg-gray-800 p-2 text-muted/50 transition-all duration-200 hover:scale-110 hover:bg-primary/40 hover:text-white"
                                        aria-label={item.label}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </a>
                                );
                            })}
                        </div>

                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()}{' '}
                            {name || 'Tech Media Retail'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
