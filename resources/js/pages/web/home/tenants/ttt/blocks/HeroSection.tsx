import FadeUp from '@/components/animate/fade-up';

export default function HeroSection() {
    return (
        <section className=" py-16">
            <FadeUp>
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                        Direct from Tirupur. Built for Wholesale.
                    </h1>

                    <p className="mx-auto mt-4 max-w-3xl text-gray-600">
                        The Tirupur Textiles is a factory outlet showroom
                        operated by TEAMA, bringing genuine Tirupur-made hosiery
                        garments at factory-level pricing.
                    </p>
                </div>
            </FadeUp>
        </section>
    );
}
