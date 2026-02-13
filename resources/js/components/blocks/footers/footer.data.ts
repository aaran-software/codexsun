// resources/js/components/footer/footer.data.ts

import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

/* ===========================
   Company Info
=========================== */

export const footerCompany = {
    name: 'Tech Media Pvt Ltd',
    tagline:
        'A factory outlet showroom operated by TEAMA,\n' +
        'representing 600+ Tirupur garment manufacturing units.\n' +
        'Direct sourcing, factory pricing & bulk supply for\n' +
        'wholesalers, retailers and corporates.',
    address:
        '436, Avinashi Road, Near CITU Office, Tiruppur, Tamil Nadu 641602',
    phone: '+91 98942 44460',
    email: 'support@techmedia.in',
    gst: '33ABCDE1234F1Z5',
    cin: 'U18101TN2024PTC123456',
};

/* ===========================
   Footer Link Sections
=========================== */

export const footerSections = [
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Our Story', href: '/our-story' },
            { label: 'Leadership Team', href: '/leadership' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press & Media', href: '/press' },
            { label: 'Investor Relations', href: '/investors' },
        ],
    },
    {
        title: 'Products',
        links: [
            { label: 'Inner Wear', href: '/products/inner-wear' },
            { label: 'Casual Wear', href: '/products/casual-wear' },
            { label: 'Corporate T-Shirts', href: '/products/corporate' },
            { label: 'Bulk Orders', href: '/bulk-orders' },
            { label: 'Custom Manufacturing', href: '/custom-manufacturing' },
            { label: 'Private Label', href: '/private-label' },
        ],
    },
    // {
    //     title: 'Corporate',
    //     links: [
    //         { label: 'Factory Outlets', href: '/outlets' },
    //         { label: 'Wholesale Program', href: '/wholesale' },
    //         { label: 'Export Division', href: '/exports' },
    //         { label: 'CSR Initiatives', href: '/csr' },
    //         { label: 'Sustainability', href: '/sustainability' },
    //         { label: 'Certifications', href: '/certifications' },
    //     ],
    // },
    {
        title: 'Legal & Compliance',
        links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Refund Policy', href: '/refund-policy' },
            { label: 'Shipping Policy', href: '/shipping-policy' },
            { label: 'Code of Conduct', href: '/code-of-conduct' },
            { label: 'Compliance', href: '/compliance' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Help Center', href: '/help' },
            { label: 'FAQs', href: '/faqs' },
            { label: 'Track Order', href: '/track-order' },
            { label: 'Return Request', href: '/returns' },
        ],
    },
];

/* ===========================
   Social Links
=========================== */

export const footerSocial = [
    {
        label: 'Facebook',
        href: 'https://facebook.com/techmedia',
        Icon: Facebook,
    },
    {
        label: 'Instagram',
        href: 'https://instagram.com/techmedia',
        Icon: Instagram,
    },
    {
        label: 'Twitter',
        href: 'https://twitter.com/techmedia',
        Icon: Twitter,
    },
    {
        label: 'LinkedIn',
        href: 'https://linkedin.com/company/techmedia',
        Icon: Linkedin,
    },
    {
        label: 'YouTube',
        href: 'https://youtube.com/techmedia',
        Icon: Youtube,
    },
].filter((s) => s.href);
