// resources/js/components/blocks/menu/SubMenuQuickLinks.tsx
'use client';

import ListItem from './ListItem';
import type { MenuItemChild } from './types';

interface SubMenuQuickLinksProps {
    items: MenuItemChild[];
}

export default function SubMenuQuickLinks({ items }: SubMenuQuickLinksProps) {
    return (
        <div>
            <h6 className="pl-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Quick Links
            </h6>
            <ul className="mt-5 grid gap-2">
                {items.slice(0, 5).map((child) => (
                    <ListItem
                        key={child.label}
                        href={child.href}
                        title={child.label}
                        icon={child.icon}
                    />

                ))}
            </ul>
        </div>
    );
}
