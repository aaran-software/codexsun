import { Link } from "@inertiajs/react";

export default function Footer() {
    return (
        <footer className="bg-[#0f0f0f] text-gray-300">

            {/* MAIN FOOTER */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

                    {/* BRAND */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            The Tirupur Textiles
                        </h3>

                        <p className="text-sm leading-relaxed text-gray-400 mb-6">
                            A factory outlet showroom operated by TEAMA,
                            representing 600+ Tirupur garment manufacturing
                            units. Direct sourcing, factory pricing, and bulk
                            supply for wholesalers, retailers, and corporates.
                        </p>

                        {/* SOCIAL ICONS */}
                        <div className="flex gap-5 mt-4">
                            {socialIcon("facebook")}
                            {socialIcon("instagram")}
                            {socialIcon("linkedin")}
                            {socialIcon("whatsapp")}
                            {socialIcon("youtube")}
                        </div>
                    </div>

                    {/* USEFUL LINKS */}
                    <div>
                        <h4 className="footer-title">Useful Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/catalog">Product Catalog</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                            <li><Link href="/events">Trade Shows & Events</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* LEGAL & POLICY */}
                    <div>
                        <h4 className="footer-title">Legal & Policies</h4>
                        <ul className="footer-links">
                            <li><Link href="/terms">Terms of Use & Sale</Link></li>
                            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link href="/cookies">Cookie Policy</Link></li>
                            <li><Link href="/ads-policy">Interest-Based Ads</Link></li>
                            <li><Link href="/disclaimer">Disclaimer</Link></li>
                        </ul>
                    </div>

                    {/* LET US HELP YOU */}
                    <div>
                        <h4 className="footer-title">Let Us Help You</h4>
                        <ul className="footer-links">
                            <li><Link href="/account">Your Account</Link></li>
                            <li><Link href="/bulk-enquiry">Bulk Enquiry</Link></li>
                            <li><Link href="/returns">Returns & Claims</Link></li>
                            <li><Link href="/shipping">Shipping & Delivery</Link></li>
                            <li><Link href="/faq">FAQs</Link></li>
                            <li><Link href="/support">Customer Support</Link></li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} The Tirupur Textiles · A Unit of TEAMA · All Rights Reserved
            </div>
        </footer>
    );
}

/* ---------------- ICON HELPER ---------------- */

function socialIcon(type: string) {
    const icons: Record<string, JSX.Element> = {
        facebook: (
            <path d="M22 12a10 10 0 10-11.6 9.9v-7h-2v-3h2V9.5c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V11h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/>
        ),
        instagram: (
            <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10z"/>
        ),
        linkedin: (
            <path d="M4 3a2 2 0 110 4 2 2 0 010-4zm-2 6h4v12H2V9zm7 0h4v2h.1a4.4 4.4 0 013.9-2c4.2 0 5 2.8 5 6.4V21h-4v-5.4c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9V9z"/>
        ),
        whatsapp: (
            <path d="M20.5 3.5A11.8 11.8 0 003.4 18.7L2 22l3.4-1.3A11.8 11.8 0 1020.5 3.5z"/>
        ),
        youtube: (
            <path d="M23 7.5s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C16.9 4 12 4 12 4s-4.9 0-8.1.3c-.4 0-1.3.1-2.1.9-.6.7-.8 2.3-.8 2.3S1 9.4 1 11.3v1.5c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.9.8 2.4.9 1.7.2 7.6.3 7.6.3s4.9 0 8.1-.3c.4 0 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8v-1.5c0-1.9-.2-3.8-.2-3.8z"/>
        ),
    };

    return (
        <a
            href="#"
            className="text-gray-400 hover:text-white transition"
            aria-label={type}
        >
            <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                {icons[type]}
            </svg>
        </a>
    );
}
