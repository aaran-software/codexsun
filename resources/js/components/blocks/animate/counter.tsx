// resources/js/components/animate/counter.tsx

'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
    value: number;
    suffix?: string;
    duration?: number;
    className?: string;
}

export default function Counter({
    value,
    suffix = '',
    duration = 2000,
    className = '',
}: CounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const end = value;
                    const increment = end / (duration / 16);

                    const timer = setInterval(() => {
                        start += increment;
                        setCount(Math.floor(start));

                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        }
                    }, 16);

                    return () => clearInterval(timer);
                }
            },
            { threshold: 0.5 },
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <div ref={ref} className={className}>
            {count}
            {suffix}
        </div>
    );
}
