import FadeUp from '@/components/animate/fade-up';
import TeamaLogo from '@/pages/web/abouts/blocks/TeamaLogo';

export default function AboutTeamaSection() {
    return (
        <section className="bg-gray-50 py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                    {/* LEFT: CONTENT */}
                    <div className="max-w-xl">
                        <FadeUp>
                            <h2 className="text-3xl font-semibold text-gray-900">
                                About TEAMA
                            </h2>
                        </FadeUp>

                        <FadeUp delay={0.1}>
                            <div className="mt-4 h-px w-24 bg-gray-300" />
                        </FadeUp>

                        <FadeUp delay={0.2}>
                            <p className="mt-8 text-lg leading-relaxed text-gray-600">
                                Tirupur Exporters and Manufacturers Association
                                (TEAMA) is one of the major textile associations
                                in Tamil Nadu, representing over 1000 garment
                                manufacturers from Tirupur, a globally
                                recognized knitwear hub.
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.3}>
                            <p className="mt-5 text-lg leading-relaxed text-gray-600">
                                Tirupur is home to more than 12,500 knitwear
                                garment-making and allied units, catering to
                                exports valued at approximately USD 4 Billion
                                and a domestic market of around USD 2.80
                                Billion.
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.4}>
                            <p className="mt-5 text-lg leading-relaxed text-gray-600">
                                TEAMA actively represents the textile industry
                                before Central and State Governments and
                                supports skill development, quality initiatives,
                                and sustainable manufacturing practices.
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.5}>
                            <p className="mt-5 text-lg leading-relaxed text-gray-600">
                                Established on <strong>5th January 2026</strong>
                                ,<strong> The Tirupur Textiles</strong> operates
                                with the support of TEAMA, enabling buyers to
                                source garments through a structured,
                                association-led manufacturing ecosystem.
                            </p>
                        </FadeUp>
                    </div>

                    {/* RIGHT: TEAMA LOGO */}
                    <FadeUp delay={0.3}>
                        <div className="flex justify-center lg:justify-end">
                            <TeamaLogo className="w-60 text-orange-500 opacity-90" />
                        </div>
                    </FadeUp>
                </div>
            </div>
        </section>
    );
}
