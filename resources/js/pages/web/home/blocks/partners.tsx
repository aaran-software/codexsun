
'use client';

const partners = [
    { id: 1, src: '/assets/partner.jpg', alt: 'Partner 1' },
    { id: 2, src: '/assets/partner.jpg', alt: 'Partner 2' },
    { id: 3, src: '/assets/partner.jpg', alt: 'Partner 3' },
    { id: 4, src: '/assets/partner.jpg', alt: 'Partner 4' },
    { id: 5, src: '/assets/partner.jpg', alt: 'Partner 5' },
    { id: 6, src: '/assets/partner.jpg', alt: 'Partner 6' },
];

export default function Partners() {
    return (
        <section className="bg-muted/30 px-4 py-16 md:px-[10%] md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        Our Trusted Partners
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Proud to collaborate with industry leaders who share our
                        commitment to excellence.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="flex items-center justify-center rounded-lg bg-background p-6 transition-shadow hover:shadow-md"
                        >
                            <img
                                src={partner.src}
                                alt={partner.alt}
                                className="h-auto w-full max-w-[120px] object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
