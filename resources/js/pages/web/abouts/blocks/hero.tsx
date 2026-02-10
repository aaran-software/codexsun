import FadeUp from '@/components/animate/fade-up';

export default function AboutHero() {
    return (
        <section className="bg-white py-28">
            <div className="mx-auto max-w-6xl px-6 text-center">
                {/* Bold Heading */}
                <FadeUp>
                    <h1 className="text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                        Direct from Tirupur.
                        <br />
                        Built for Wholesale.
                    </h1>
                </FadeUp>

                {/* Divider */}
                <FadeUp delay={0.15}>
                    <div className="mx-auto mt-8 mb-10 h-px w-24 bg-gray-300" />
                </FadeUp>

                {/* Description */}
                <FadeUp delay={0.25}>
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                        The Tirupur Textiles is a factory outlet garment
                        showroom based in Puducherry, created to connect
                        Tirupur’s manufacturing strength directly with
                        wholesalers, retailers, corporate buyers, and
                        institutions.
                    </p>
                </FadeUp>

                <FadeUp delay={0.35}>
                    <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
                        Operating on a direct-from-factory sourcing model, we
                        eliminate intermediaries and ensure consistent access to
                        quality garments at factory-level pricing.
                    </p>
                </FadeUp>
            </div>
        </section>
    );
}
