'use client';

import { usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Bug,
    Smile,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

type FlashType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'bug'
    | 'happy'
    | 'light'
    | 'dark';

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (!flash) return;

        const showFlash = (type: FlashType, data: any) => {
            if (!data) return;

            // Create stable toast ID based on content → prevents duplicates, updates if same
            const toastId = `flash-${type}-${
                typeof data === 'string'
                    ? data
                    : `${data?.title || ''}-${data?.description || ''}`
            }`;

            const iconMap = {
                success: <CheckCircle2 size={20} />,
                error: <XCircle size={20} />,
                warning: <AlertTriangle size={20} />,
                info: <Info size={20} />,
                bug: <Bug size={20} />,
                happy: <Smile size={20} />,
                light: <Info size={20} />,
                dark: <Info size={20} />,
            };

            // Use sonner directly with ID (replaces if same ID exists)
            toast[type as any](typeof data === 'string' ? data : data?.title, {
                id: toastId,
                description:
                    typeof data === 'object' ? data?.description : undefined,
                icon: iconMap[type],
            });
        };

        showFlash('success', flash.success);
        showFlash('error', flash.error);
        showFlash('warning', flash.warning);
        showFlash('info', flash.info);
        showFlash('bug', flash.bug);
        showFlash('happy', flash.happy);
        showFlash('light', flash.light);
        showFlash('dark', flash.dark);
    }, [flash]);

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>

            <Toaster
                position="top-right"
                visibleToasts={5}
                expand={false}
                richColors
            />
        </>
    );
}
