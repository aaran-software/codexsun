// ThemeProvider.tsx
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Theme {
    mode: 'light' | 'dark';
    variables?: Record<string, string>;
}

interface ThemeProviderProps {
    theme?: Theme;
    children: ReactNode;
}

const FALLBACK_LIGHT = {
    '--background': 'oklch(0.98 0 0)',
    '--foreground': 'oklch(0.28 0.04 260)',
    '--primary': 'oklch(0.65 0.2 260)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--secondary': 'oklch(0.93 0.01 260)',
    '--muted': 'oklch(0.97 0 0)',
    '--accent': 'oklch(0.93 0.03 260)',
    '--destructive': 'oklch(0.64 0.21 25)',
    '--border': 'oklch(0.87 0.01 260)',
    '--radius': '0.5rem',
};

const FALLBACK_DARK = {
    '--background': 'oklch(0.15 0 0)',
    '--foreground': 'oklch(0.95 0.02 260)',
    '--primary': 'oklch(0.70 0.15 277)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--secondary': 'oklch(0.25 0.02 260)',
    '--muted': 'oklch(0.22 0.02 260)',
    '--accent': 'oklch(0.30 0.03 260)',
    '--destructive': 'oklch(0.55 0.18 25)',
    '--border': 'oklch(0.30 0.02 260)',
    '--radius': '0.5rem',
};

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    useEffect(() => {
        const root = document.documentElement;

        root.removeAttribute('style');

        const isDark = theme?.mode === 'dark';
        const fallback = isDark ? FALLBACK_DARK : FALLBACK_LIGHT;

        // Apply fallback first (safe defaults)
        Object.entries(fallback).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Then override with real theme variables if available
        if (theme?.variables) {
            Object.entries(theme.variables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        root.classList.toggle('dark', isDark);
    }, [theme]);

    return <>{children}</>;
}
