'use client';

import { footerCompany, footerSections, footerSocial } from './footer.data';
import FooterBottom from './FooterBottom';
import FooterBrand from './FooterBrand';
import FooterLinksSection from './FooterLinksSection';
import FooterSocial from './FooterSocial';


export default function FooterCard() {
    return (
        <footer className="bg-gray-950 text-gray-300">
            <div className="mx-auto max-w-350 px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <FooterBrand
                            companyName={footerCompany.name}
                            tagline={footerCompany.tagline}
                        />

                        <div className="mt-6 space-y-1 text-xs text-gray-400">
                            <p>{footerCompany.address}</p>
                            <p>GST: {footerCompany.gst}</p>
                            <p>CIN: {footerCompany.cin}</p>
                            <p>{footerCompany.phone}</p>
                            <p>{footerCompany.email}</p>
                        </div>
                    </div>

                    {/* Dynamic Corporate Sections */}
                    {footerSections.map((section) => (
                        <FooterLinksSection
                            key={section.title}
                            title={section.title}
                            links={section.links}
                        />
                    ))}
                </div>

                {/* Social */}
                <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-6 lg:flex-row">
                    <FooterSocial items={footerSocial} />

                    <FooterBottom companyName={footerCompany.name} />
                </div>
            </div>
        </footer>
    );
}
