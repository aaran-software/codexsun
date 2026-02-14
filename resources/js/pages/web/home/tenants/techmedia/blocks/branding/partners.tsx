'use client';

/* ==============================
   Partner Data
================================ */

const partners = [
    {
        id: 1,
        src: '/assets/partner.jpg',
        company: 'Arun Textiles',
        md: 'Mr. Arun Kumar',
        city: 'Tiruppur',
    },
    {
        id: 2,
        src: '/assets/partner.jpg',
        company: 'SK Garments',
        md: 'Mr. Suresh Kumar',
        city: 'Coimbatore',
    },
    {
        id: 3,
        src: '/assets/partner.jpg',
        company: 'Elite Exports',
        md: 'Mr. Ramesh',
        city: 'Chennai',
    },
    {
        id: 4,
        src: '/assets/partner.jpg',
        company: 'Cotton Hub',
        md: 'Mr. Prakash',
        city: 'Erode',
    },
    {
        id: 5,
        src: '/assets/partner.jpg',
        company: 'Prime Apparel',
        md: 'Mr. Dinesh',
        city: 'Bangalore',
    },
];

/* Duplicate for infinite scroll */
const marqueePartners = [...partners, ...partners];

export default function Partners() {
    return (
        <section className="bg-muted/30 py-20">
            <div className="mx-auto max-w-350 px-6">
                {/* Heading */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Our Trusted Partners
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Proud to collaborate with leading textile manufacturers.
                    </p>
                </div>

                {/* Marquee Wrapper */}
                <div className="group relative overflow-hidden">
                    {/* Fade edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent" />

                    {/* Track */}
                    <div className="flex w-max animate-[marquee_25s_linear_infinite] gap-12 group-hover:paused">
                        {marqueePartners.map((partner, index) => (
                            <div
                                key={`${partner.id}-${index}`}
                                className="flex min-w-55 flex-col items-center rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.company}
                                    className="mb-4 h-20 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                                />

                                <h4 className="text-sm font-semibold text-foreground">
                                    {partner.company}
                                </h4>

                                <p className="text-xs text-muted-foreground">
                                    {partner.md}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {partner.city}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Keyframes via Tailwind layer */}
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
        </section>
    );
}
