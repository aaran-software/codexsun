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

export interface HeroData {
    title?: string;
    subtitle?: string;
}

export interface StatsData {
    backgroundColor?: string;
    borderColor?: string;
    stats: StatItem[];
}

export interface CatalogCategory {
    featuredBadgeVariant:
        | 'emerald'
        | 'amber'
        | 'black'
        | 'blue'
        | 'purple'
        | 'rose'
        | 'cyan'
        | 'indigo'
        | 'teal'
        | undefined;
    title: string;
    slug: string;
    description: string;
    image: string;
    variants: string[];
    bulkBadge?: string;
    featuredBadge?: string;
    badgeVariant?:
        | 'emerald'
        | 'amber'
        | 'blue'
        | 'purple'
        | 'rose'
        | 'cyan'
        | 'indigo'
        | 'teal';
}

export interface CatalogData {
    heading: string;
    subheading: string;
    categories: CatalogCategory[];
}

export interface ProductCategory {
    name: string;
    image: string;
    slug: string;
}
export interface ProductRangeData {
    heading: string;
    subheading?: string;
    categories: ProductCategory[];
}

export interface WhyChooseFeature {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface WhyChooseUSData {
    heading: string;
    subheading: string;
    features: WhyChooseFeature[];
}

export interface BrandLogo {
    name: string;
    logo: string;
}

export interface BrandSliderData {
    heading: string;
    backgroundColor: string;
    hoverColor: string;
    animationDuration?: number;
    pauseOnHover?: boolean;
    logos: BrandLogo[];
}

export interface FeaturesData {
    backgroundColor: string;
    title: string;
    description: string;
    image: {
        src: string;
        alt: string;
    };
    bullets?: string[];
}

export interface CallToActionData {
    backgroundColor: string;
    title: string;
    description: string;
    buttonText: string;
    buttonHref: string;
    buttonBg: string;
    buttonTextColor: string;
    buttonHoverBg?: string;
}


export interface LocationTiming {
    day: string;
    hours: string;
}

export interface LocationContact {
    phone: string;
    email: string;
}

export interface LocationImage {
    src: string;
    alt: string;
    className: string;
}

export interface LocationMap {
    embedUrl: string;
    title: string;
    placeId?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface LocationData {
    'displayName':string;
    title: string;
    address: string;
    timings: LocationTiming[];
    contact: LocationContact;
    buttonText: string;
    buttonHref: string;
    image: LocationImage;
    map: LocationMap;
}

export interface NewsletterImage {
    src: string;
    alt: string;
    widthClass: string;
}
export interface NewsletterData {
    title: string;
    description: string;
    placeholderName: string;
    placeholderEmail: string;
    buttonText: string;
    trustNote: string;
    backgroundColor: string;
    buttonBg: string;
    buttonHoverBg: string;
    image?: NewsletterImage;
}

export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterSocial {
    label: string;
    href: string;
    Icon: string;
}

export interface FooterData {
    sections: FooterSection[];
    social: FooterSocial[];
}

export interface CompanyData {
    name: string;
    displayName: string;
    fullName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pinCode: string;
    email: string;
    email2: string;
    mobile1: string;
    mobile2: string;
    whatsapp: string;
    gstin: string;
    tagline: string;
    about: string;
}

export interface BlogPost {
    id: number;
    title: string;
    excerpt?: string;
    author: string;
    date: string;
    image: string;
    slug: string;
}

export interface BlogData {
    heading: string;
    description: string;
    buttonText: string;
    buttonHref: string;
    featuredPosts: BlogPost[];
}


export interface HomePageProps extends SharedProps {
    message?: MessageData;
    company?: CompanyData;
    abouts?: AboutData | null;
    hero?: HeroData | null;
    stats?: StatsData;
    catalog?: CatalogData;
    productRange?: ProductRangeData;
    whyChooseUs?: WhyChooseUSData;
    brandSlider?: BrandSliderData;
    features?: FeaturesData;
    callToAction?: CallToActionData;
    location?: LocationData;
    newsletter?: NewsletterData;
    footer: FooterData;
    blog:BlogData;
}
