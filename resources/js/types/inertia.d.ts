// resources/js/types/inertia.d.ts  (keep minimal / empty if no real shared props)
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

declare module '@inertiajs/react' {
    interface PageProps extends InertiaPageProps {}
}
