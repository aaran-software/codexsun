import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function GlobalSpinner() {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const start = () => {
            timerRef.current = window.setTimeout(() => {
                setVisible(true);
            }, 200);
        };

        const finish = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setVisible(false);
        };

        const removeStart = router.on('start', start);
        const removeFinish = router.on('finish', finish);
        const removeError = router.on('error', finish);

        return () => {
            removeStart();
            removeFinish();
            removeError();
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            {/* Spinner ring */}
            <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-muted border-t-foreground animate-spin" />

                {/* Stable center letter */}
                <span className="text-5xl font-bold text-foreground select-none">
                    C
                </span>
            </div>
        </div>
    );
}
