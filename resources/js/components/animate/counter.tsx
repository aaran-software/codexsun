import {
    motion,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Props = {
    value: number;
    suffix?: string;
    label: string;
};

export default function Counter({ value, suffix = '', label }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    const count = useMotionValue(0);
    const spring = useSpring(count, {
        stiffness: 100,
        damping: 30,
    });

    const [displayValue, setDisplayValue] = useState(0);

    useMotionValueEvent(spring, 'change', (latest) => {
        setDisplayValue(Math.floor(latest));
    });

    useEffect(() => {
        if (inView) {
            count.set(value);
        }
    }, [count, inView, value]);

    return (
        <div ref={ref} className="text-center">
            <motion.span className="text-4xl font-bold text-gray-900">
                {displayValue}
                {suffix}
            </motion.span>

            <p className="mt-2 text-sm text-gray-600">{label}</p>
        </div>
    );
}
