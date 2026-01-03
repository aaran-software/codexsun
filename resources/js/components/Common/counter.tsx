import { useEffect, useRef, useState } from "react";

export default function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;

                    let start = 0;
                    const duration = 1500;
                    const increment = value / (duration / 16);

                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= value) {
                            setCount(value);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [value]);

    return (
        <div ref={ref} className="text-3xl font-bold text-primary md:text-4xl">
            {count}
            {suffix}
        </div>
    );
}
