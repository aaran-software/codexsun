'use client';

import clsx from 'clsx';
import { X, CheckCircle2, AlertTriangle, Info, Bug, Smile } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

type ToastVariant =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'bug'
    | 'happy'
    | 'light'
    | 'dark'
    | 'default';

interface CustomToastProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    variant?: ToastVariant;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Light + Dark adaptive variant styles
 */
const variantStyles: Record<ToastVariant, string> = {
    success: `
    border-emerald-500/50 bg-emerald-600/10 text-emerald-500
    dark:bg-emerald-600/50 dark:text-emerald-600/15 dark:border-emerald-800

  `,
    error: `
    border-red-500/50 bg-red-600/10 text-red-500
    dark:bg-red-600/50 dark:text-red-600/15 dark:border-red-800
  `,
    warning: `
    border-amber-500/50 bg-amber-600/10 text-amber-500
    dark:bg-amber-600/50 dark:text-amber-600/15 dark:border-amber-800
  `,
    info: `
    border-blue-400/50 bg-blue-500/10 text-blue-500
    dark:bg-blue-600/60 dark:text-blue-600/20 dark:border-blue-400
  `,
    bug: `
    border-purple-500/30 bg-purple-500/10 text-purple-500
    dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800
  `,
    happy: `
    border-pink-500/30 bg-pink-500/10 text-pink-500
    dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800
  `,
    light: `
    border-gray-300 bg-white text-gray-900
    dark:bg-white dark:text-gray-900 dark:border-gray-300
  `,
    dark: `
    border-gray-700 bg-gray-900 text-gray-100
    dark:bg-black dark:text-gray-200 dark:border-gray-700
  `,
    default: `
    border-border bg-background text-foreground
  `,
};

/**
 * Default Icons per variant
 */
const variantIcons: Record<ToastVariant, ReactNode> = {
    success: <CheckCircle2 size={20} />,
    error: <AlertTriangle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
    bug: <Bug size={20} />,
    happy: <Smile size={20} />,
    light: <Info size={20} />,
    dark: <Info size={20} />,
    default: <Info size={20} />,
};

export function showCustomToast({
    title,
    description,
    icon,
    variant = 'default',
    actionLabel,
    onAction,
}: CustomToastProps) {
    toast.custom((id) => (
        <div
            className={clsx(
                'relative w-95 rounded-xl border p-4 shadow-lg',
                'flex gap-3 transition-all duration-300',
                'backdrop-blur-sm',
                variantStyles[variant],
            )}
        >
            {/* Icon */}
            <div className="mt-1 shrink-0 opacity-90">
                {icon ?? variantIcons[variant]}
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="leading-tight font-semibold">{title}</div>

                {description && (
                    <div className="mt-1 text-sm opacity-80">{description}</div>
                )}

                {actionLabel && (
                    <button
                        onClick={() => {
                            onAction?.();
                            toast.dismiss(id);
                        }}
                        className="mt-3 text-sm font-medium underline transition hover:opacity-80"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={() => toast.dismiss(id)}
                className="absolute top-3 right-3 opacity-60 transition hover:opacity-100"
            >
                <X size={16} />
            </button>
        </div>
    ));
}
