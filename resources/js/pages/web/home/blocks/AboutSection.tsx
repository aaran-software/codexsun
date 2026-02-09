import FadeUp from '@/components/animate/fade-up';

export default function AboutSection() {
    return (
        <section className="bg-gray-50 py-16">
            <FadeUp>
                <div className="container mx-auto max-w-4xl px-4">
                    <p>About</p>
                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                        The Tirupur Textiles
                    </h2>

                    <p className="leading-relaxed text-gray-700">
                        The Tirupur Textiles is a factory outlet garment
                        showroom in Pondicherry, operated by
                        <span className="text-xl">TEAMA</span>– Tirupur
                        Exporters and Manufacturing Association.
                    </p>
                </div>
            </FadeUp>
        </section>
    );
}
