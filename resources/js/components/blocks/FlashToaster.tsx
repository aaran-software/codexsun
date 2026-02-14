'use client';

import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function FlashToaster() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        if (flash.warning) {
            toast.warning(flash.warning);
        }

        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
