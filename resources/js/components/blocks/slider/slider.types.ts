export type SlideDirection = 'left' | 'right' | 'fade';

export type VariantType =
    | 'classic'
    | 'luxury'
    | 'industrial'
    | 'saas'
    | 'cinematic';

export type BackgroundMode = 'normal' | 'parallax' | '3d' | 'cinematic';

export type MediaType =
    | { type: 'image'; src: string }
    | { type: 'video'; mp4: string; poster?: string }
    | { type: 'youtube'; videoId: string };

export type HighlightVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'glass';

export type CTAColor =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'dark'
    | 'light';

export interface Highlight {
    text: string;
    variant?: HighlightVariant;
}

export interface Slide {
    id: number;
    title: string;
    tagline: string;
    action: { text: string; href: string };
    media: MediaType;

    highlights?: Highlight[];
    btn_cta?: string;
    duration?: number;

    direction?: SlideDirection;
    variant?: VariantType;
    intensity?: 'low' | 'medium' | 'high';
    ctaColor?: CTAColor;

    backgroundMode?: BackgroundMode; // NEW
    showOverlay?: boolean;
    overlayColor?: string;
}
export const sliderOptions = {
    parallax: true,
    particles: true,
    defaultVariant: 'luxury' as VariantType,
    defaultIntensity: 'medium' as 'low' | 'medium' | 'high',
    defaultDirection: 'left' as SlideDirection,
    defaultBackgroundMode: 'normal' as BackgroundMode,
};
export class SliderOptions {}
