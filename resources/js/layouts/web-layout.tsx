import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import WebMenu from '@/components/blocks/menu/web-menu';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function WebLayout({ children }: PropsWithChildren) {
    const { tenant } = usePage().props as any;

    const theme = tenant?.theme ?? {
        mode: 'light' as const,
        variables: {},
    };

    return (
        <ThemeProvider theme={theme}>
            <WebMenu />
            <div className="min-h-screen bg-background text-foreground antialiased">
                {children}
                <Toaster />
            </div>
        </ThemeProvider>
    );
}
