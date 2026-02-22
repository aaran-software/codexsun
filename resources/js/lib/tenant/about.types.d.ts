import type {
    AboutData,
    CallToActionData,
    CompanyData,
    FeaturesData,
    FooterData,
    HeroData,
    SharedProps,
    WhyChooseUSData,
} from '@/lib/tenant/types';

export interface TeamMember {
    name: string;
    designation: string;
    bio?: string;
    image?: string;
}

export interface TeamData {
    heading: string;
    subheading?: string;
    members: TeamMember[];
}

export interface Testimonial {
    quote: string;
    name: string;
    role: string;
    company: string;
    avatar?: string;
    rating?: number; // optional, default 5
}

export interface TestimonialsData {
    heading: string;
    subheading?: string;
    items: Testimonial[];
}

export interface AboutPageProps extends SharedProps {
    abouts?: AboutData | null;
    hero?: HeroData | null;
    footer: FooterData;
    whyChooseUs: WhyChooseUSData;
    features?: FeaturesData;
    company?: CompanyData;
    team?: TeamData | null;
    testimonials?: TestimonialsData | null;
    callToAction?: CallToActionData;
}
