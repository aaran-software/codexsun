'use client';

import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function FlashToaster() {
    const { flash } = usePage().props as any;

    const shownFlashId = useRef<string | null>(null);

    useEffect(() => {
        if (!flash?.flash_id) return;

        // Prevent duplicate execution
        if (shownFlashId.current === flash.flash_id) return;

        shownFlashId.current = flash.flash_id;

        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.warning) toast.warning(flash.warning);
        if (flash.info) toast.info(flash.info);
    }, [flash?.flash_id]);

    return null;
}
