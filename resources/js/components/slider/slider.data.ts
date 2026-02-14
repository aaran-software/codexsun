import type { Slide } from './slider.types';

export const slides: Slide[] = [
    {
        id: 1,
        title: 'Luxury Textile Manufacturing',
        tagline: 'Premium knitted garment production.',
        action: { text: 'View Collections', href: '/shop' },
        media: {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600',
        },
        highlights: [
            { text: 'Factory Direct', variant: 'success' },
            { text: 'Bulk Orders', variant: 'primary' },
        ],
        btn_cta: 'bg-green-600 hover:bg-green-700 text-white',
        duration: 6000,
        intensity: 'medium',
        backgroundMode: 'parallax',
    },
    {
        id: 2,
        title: 'Industrial Scale Production',
        tagline: 'Bold. Fast. Reliable.',
        action: { text: 'Contact Us', href: '/contact' },
        media: {
            type: 'video',
            mp4: '/assets/ttt/videos/ttt_opening.mp4',
        },
        highlights: [
            { text: 'Factory Direct', variant: 'success' },
            { text: 'Bulk Orders', variant: 'primary' },
        ],
        intensity: 'high',
    },
    {
        id: 3,
        title: 'YouTube Marketing Showcase',
        tagline: 'Embedded autoplay background.',
        action: { text: 'Learn More', href: '/about' },
        media: {
            type: 'youtube',
            videoId: '16zrEPOsIcI',
        },
        duration: 15000,
        highlights: [
            { text: 'Factory Direct', variant: 'success' },
            { text: 'Bulk Orders', variant: 'primary' },
        ],
    },
    {
        id: 4,
        title: 'Cinematic Production Mode',
        tagline: 'Slow motion premium hero.',
        action: { text: 'Explore', href: '/explore' },
        media: {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1600',
        },
        variant: 'cinematic',
        intensity: 'high',
        backgroundMode: 'cinematic',
    },
    {
        id: 5,
        title: 'Classic Corporate Slide',
        tagline: 'Clean and minimal presentation.',
        action: { text: 'Discover', href: '/discover' },
        media: {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=1600',
        },
        variant: 'classic',
        intensity: 'low',
    },
];
