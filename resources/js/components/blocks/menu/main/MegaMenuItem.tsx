// resources/js/components/blocks/menu/MegaMenuItem.tsx
'use client';

import {
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

import SubMenuHero from './SubMenuHero';
import SubMenuQuickLinks from './SubMenuQuickLinks';
import SubMenuSection from './SubMenuSection';

import type { MenuItem } from './types';

export default function MegaMenuItem({ item }: { item: MenuItem }) {
    return (
        <NavigationMenuItem className="group/item relative">
            <NavigationMenuTrigger
                className={cn(
                    'bg-transparent px-4 py-2.5 text-xl font-medium transition-colors duration-200',
                    'text-foreground/80 hover:text-foreground focus:text-foreground',
                    'data-[state=open]:font-semibold data-[state=open]:text-primary',
                )}
            >
                {item.label}
            </NavigationMenuTrigger>

            <span
                className={cn(
                    'pointer-events-none absolute -bottom-[3px] left-1 h-[2.5px] bg-primary',
                    'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    'origin-left scale-x-0 group-hover/item:scale-x-100',
                    'data-[state=open]:scale-x-100',
                )}
                style={{ width: 'calc(100% - 8px)' }}
            />

            <NavigationMenuContent
                className={cn(
                    'absolute top-full left-0 w-screen max-w-none',
                    'pointer-events-auto',
                    'data-[state=closed]:animate-out data-[state=open]:animate-in',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'duration-150',
                )}
            >
                <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 rounded-b-xl border bg-popover p-10 shadow-xl">
                    <div className="col-span-5">
                        <SubMenuHero item={item} />
                    </div>
                    <div className="col-span-4">
                        <SubMenuSection
                            title="Capabilities"
                            items={item.children ?? []}
                        />
                    </div>
                    <div className="col-span-3">
                        <SubMenuQuickLinks items={item.children ?? []} />
                    </div>
                </div>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
