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

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        // Clear previous inline styles
        root.removeAttribute('style');

        // Apply variables safely
        if (theme.variables) {
            Object.entries(theme.variables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        // Toggle dark class
        root.classList.toggle('dark', theme.mode === 'dark');
    }, [theme]);

    return <>{children}</>;
}
