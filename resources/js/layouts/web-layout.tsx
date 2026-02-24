import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import MainMenu from '@/components/blocks/menu/main/MainMenu';
import WebMenu from '@/components/blocks/menu/web-menu';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function WebLayout({ children }: PropsWithChildren) {
    const { currentTenant } = usePage().props as any;

    const theme = currentTenant?.theme ?? {
        mode: 'light' as const,
        variables: {},
    };

    // console.log(currentTenant);

    return (
        <ThemeProvider theme={theme}>
            {/*<WebMenu />*/}
            <MainMenu />
            <div className="min-h-screen bg-background text-foreground antialiased">
                {children}
                <Toaster />
            </div>
        </ThemeProvider>
    );
}
