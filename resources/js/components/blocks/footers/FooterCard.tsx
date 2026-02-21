'use client';

import { useCurrentTenant } from '@/lib/tenant';
import FooterBottom from './FooterBottom';
import FooterBrand from './FooterBrand';
import FooterLinksSection from './FooterLinksSection';
import FooterSocial from './FooterSocial';

export default function FooterCard() {
    const tenant = useCurrentTenant();

    const { footer, logo, company } = tenant; // ← get logo from root level

    if (!company?.name) return null;

    const LogoComponent = logo.component;
    const logoProps = logo.props || {};

    const { sections, social } = footer;

    return (
        <footer className="bg-gray-950 text-gray-300">
            <div className="mx-auto max-w-350 px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <FooterBrand
                            companyName={company.name}
                            tagline={company.tagline}
                            LogoComponent={LogoComponent}
                            logoProps={logoProps}
                        />

                        <div className="mt-6 space-y-1 text-xs text-gray-400">
                            <p>
                                {company.address1} {company.address2}{' '}
                                {company.city} {company.state}
                                {' - '}
                                {company.pinCode}
                            </p>
                            {company.gstin && <p>GST: {company.gstin}</p>}
                            <p>{company.mobile1}</p>
                            <p>{company.email}</p>
                        </div>
                    </div>

                    {/* Dynamic sections */}
                    {sections.map((section) => (
                        <FooterLinksSection
                            key={section.title}
                            title={section.title}
                            links={section.links}
                        />
                    ))}
                </div>

                {/* Social + bottom */}
                <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-6 lg:flex-row">
                    <FooterSocial items={social} />
                    <FooterBottom companyName={company.name} />
                </div>
            </div>
        </footer>
    );
}
