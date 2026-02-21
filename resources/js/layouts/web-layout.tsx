import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function WebLayout({ children }: PropsWithChildren) {
    const { tenant } = usePage().props as any;

    const theme = tenant?.theme ?? {
        mode: 'light' as const,
        variables: {},
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="min-h-screen bg-background text-foreground antialiased">
                {children}
                <Toaster />
            </div>
        </ThemeProvider>
    );
}
