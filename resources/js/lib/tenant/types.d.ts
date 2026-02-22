// resources/js/types/web.d.ts

export interface MessageData {
    greetings: string;
    date: string;
}

export interface Tenant {
    id: number;
    name: string;
    domain?: string;
    logo?: string | null;
    short_name?: string;
    primary_color?: string;
    // add any other tenant fields you actually pass from backend
}

export interface SharedProps {
    tenant?: Tenant;
    // other globally shared props (auth, flash, etc.)
    [key: string]: unknown;
}

export interface AboutData {
    backgroundColor?: string;
    title: string;
    subtitle?: string;
    content: string[];
    image?: {
        src: string;
        alt: string;
    } | null;
}

export interface HomePageProps extends SharedProps {
    message?: MessageData;
    abouts?: AboutData | null;
    hero?: HeroData | null;
}
export interface HeroData {
    title?: string;
    subtitle?: string;
}
