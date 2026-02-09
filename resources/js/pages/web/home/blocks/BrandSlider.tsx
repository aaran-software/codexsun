import { motion } from 'framer-motion';
import { brandLogos } from './data/brand-logos';

export default function BrandSlider() {
    return (
        <section className="border-t bg-white py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-xl font-semibold text-gray-900">
                    Trusted by Leading Brands
                </h2>

                <div className="relative overflow-hidden">
                    <motion.div
                        className="flex items-center gap-8"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{
                            repeat: Infinity,
                            duration: 20,
                            ease: 'linear',
                        }}
                    >
                        {[...brandLogos, ...brandLogos].map((brand, index) => (
                            <div
                                key={index}
                                className="flex min-w-37.5 items-center justify-center"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    loading="lazy"
                                    className="h-28 object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
