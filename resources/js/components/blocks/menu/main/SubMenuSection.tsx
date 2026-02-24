// resources/js/components/blocks/menu/SubMenuSection.tsx
'use client';

import ListItem from './ListItem';
import type { MenuItemChild } from './types';

interface SubMenuSectionProps {
    title: string;
    items: MenuItemChild[];
}

export default function SubMenuSection({ title, items }: SubMenuSectionProps) {
    return (
        <div>
            <h6 className="pl-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                {title}
            </h6>
            <ul className="mt-5 grid grid-cols-1 gap-3">
                {items.map((child) => (
                    <ListItem
                        key={child.label}
                        href={child.href}
                        title={child.label}
                        icon={child.icon}
                    >
                        {child.description}
                    </ListItem>
                ))}
            </ul>
        </div>
    );
}
