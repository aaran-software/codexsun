// resources/js/components/blocks/menu/ListItem.tsx
'use client';

import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import * as React from 'react';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface ListItemProps extends Omit<InertiaLinkProps, 'children'> {
    title: string;
    children?: React.ReactNode;
    icon?: string;
    href: string;
    className?: string;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
    ({ className, title, children, icon, href, ...props }, ref) => {
        const Icon =
            (LucideIcons as any)[icon || 'Circle'] || LucideIcons.Circle;

        return (
            <li>
                <NavigationMenuLink asChild>
                    <Link
                        ref={ref}
                        href={href}
                        className={cn(
                            'group block rounded-2xl p-5 leading-none no-underline transition-all outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                            className,
                        )}
                        {...props}
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 rounded-xl bg-muted p-3 transition-colors group-hover:bg-accent-foreground/10">
                                <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="font-semibold tracking-tight">
                                    {title}
                                </div>
                                {children && (
                                    <p className="line-clamp-3 text-sm leading-snug text-muted-foreground">
                                        {children}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                </NavigationMenuLink>
            </li>
        );
    },
);

ListItem.displayName = 'ListItem';

export default ListItem;
