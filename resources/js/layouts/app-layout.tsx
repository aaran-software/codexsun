import { Toaster } from 'sonner';
import FlashToaster from '@/components/blocks/FlashToaster';
import GlobalSpinner from '@/components/blocks/spinner/global-spinner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {/*<GlobalSpinner />*/}
        {children}
        <FlashToaster />
        <Toaster richColors position="top-right" />
    </AppLayoutTemplate>
);
