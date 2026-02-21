import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const FORCE_TEST_SPINNER = true; // 🔴 turn OFF after testing

export default function GlobalSpinner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const start = () => {
            if (FORCE_TEST_SPINNER) {
                setVisible(true);
                return;
            }

            setTimeout(() => setVisible(true), 200);
        };

        const finish = () => {
            if (FORCE_TEST_SPINNER) {
                setTimeout(() => setVisible(false), 1500); // keep visible for test
                return;
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
            <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-foreground" />

                {/* Stable center letter */}
                <span className="text-4xl font-bold text-foreground select-none">
                    C
                </span>
            </div>
        </div>
    );
}
