'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import type { OverlayImage } from './slider.types';

interface Props {
    images?: OverlayImage[];
    enabled?: boolean;
}

export default function SliderOverlay({ images, enabled }: Props) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        if (!enabled) return;

        const handleMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [enabled]);

    if (!images || !enabled) return null;

    return (
        <>
            {images.map((img, i) => {
                const x = useTransform(
                    mouseX,
                    [0, window.innerWidth],
                    [-20, 20],
                );
                const y = useTransform(
                    mouseY,
                    [0, window.innerHeight],
                    [-20, 20],
                );

                return (
                    <motion.img
                        key={i}
                        src={img.src}
                        className={`absolute ${img.className}`}
                        style={{
                            x: img.speed ? x : 0,
                            y: img.speed ? y : 0,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.2 }}
                    />
                );
            })}
        </>
    );
}
