// resources/js/components/blocks/menu/MainNavigation.tsx
'use client';

import { usePage } from '@inertiajs/react';
import {
    NavigationMenu,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';

import MegaMenuItem from './MegaMenuItem';
import SimpleMenuItem from './SimpleMenuItem';

import type { MenuItem } from './types';

export default function MainNavigation({ menu }: { menu: MenuItem[] }) {
    const currentUrl = usePage().url;

    const current =
        menu.find((item) => !item.children?.length && item.href === currentUrl)
            ?.label || '';

    return (
        <NavigationMenu className="max-w-full">
            <NavigationMenuList className="flex-nowrap gap-8">
                {menu.map((item) =>
                    item.children && item.children.length > 0 ? (
                        <MegaMenuItem key={item.label} item={item} />
                    ) : (
                        <SimpleMenuItem
                            key={item.label}
                            item={item}
                            active={current === item.label}
                        />
                    ),
                )}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
