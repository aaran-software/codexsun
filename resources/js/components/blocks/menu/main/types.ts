// resources/js/components/blocks/menu/types.ts
export interface MenuItem {
    label: string;
    href?: string;
    description?: string;
    icon?: string;
    children?: MenuItemChild[];
}

export interface MenuItemChild {
    label: string;
    href: string;
    description?: string;
    icon?: string;
}
