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



// ── Shop / Products ─────────────────────────────────────────────────────
export interface Product {
    id: string | number;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
    isFeatured?: boolean;
    badge?: 'New' | 'Hot' | 'Sale' | null;
    // Compatibility fields (used in Custom PC Builder)
    socket?: string;
    ram_type?: string;
    form_factor?: string;
    tdp?: number;
    wattage?: number;
    supportedSockets?: string[];
    supportedFormFactors?: string[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
}

export interface ShopData {
    products: Product[];
    categories: Category[];
    featuredProducts: Product[];
    saleProducts: Product[];
}

export interface CustomPcComponent {
    id: number;
    name: string;
    price: number;
    image?: string;
    category: string;
    // Compatibility fields
    socket?: string;
    ram_type?: string;
    form_factor?: string;
    tdp?: number;
    wattage?: number;
    supportedSockets?: string[];
    supportedFormFactors?: string[];
}

export interface CustomPcData {
    heading: string;
    subheading: string;
    description: string;
    components: Record<string, CustomPcComponent[]>;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    maxQuantity?: number;
}

export interface CartData {
    heading: string;
    emptyMessage: string;
    continueShoppingText: string;
    continueShoppingHref: string;
    subtotalLabel: string;
    shippingLabel: string;
    shippingValue: string;
    totalLabel: string;
    proceedToCheckoutText: string;
    proceedToCheckoutHref: string;
    items: CartItem[];
}


export interface ProductPageProps extends SharedProps {
    abouts?: AboutData | null;
    hero?: HeroData | null;
    footer: FooterData;
    company?: CompanyData;
    callToAction?: CallToActionData;

    shop: ShopData;
    catalog?: CatalogData;
    customPc?: CustomPcData;
    cart?: CartData;
}
