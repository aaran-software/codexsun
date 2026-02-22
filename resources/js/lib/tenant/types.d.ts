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

export interface HomePageProps extends SharedProps {
    message?: MessageData;
    abouts?: AboutData | null;
    hero?: HeroData | null;
    stats?: StatsData;
    catalog?: CatalogData;
    productRange?: ProductRangeData;
    whyChooseUs?: WhyChooseUSData;
    brandSlider?: BrandSliderData;
    features?: FeaturesData;
    callToAction?: CallToActionData;
}
