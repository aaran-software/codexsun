// resources/js/types/web.d.ts

export interface Message {
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

export interface HomePageProps extends SharedProps {
    message?: Message;
}

// if you have other pages, extend SharedProps too
// export interface AboutPageProps extends SharedProps {
//     // page-specific props
// }
