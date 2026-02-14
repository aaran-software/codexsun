import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Slide } from './slider.types';

export default function SliderContent({ slide }: { slide: Slide }) {
    return (
        <div className="relative flex h-full items-center">
            <div className="mx-auto max-w-7xl px-6">
                <motion.h1
                    key={slide.id}
                    className="mb-6 text-5xl font-bold text-white md:text-7xl"
                >
                    {slide.title.split(' ').map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="mr-3 inline-block"
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8 text-xl text-gray-200"
                >
                    {slide.tagline}
                </motion.p>

                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <Link
                        href={slide.action.href}
                        className="inline-flex items-center gap-3 rounded-lg bg-white px-8 py-4 font-semibold text-black"
                    >
                        {slide.action.text}
                        <Play className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
