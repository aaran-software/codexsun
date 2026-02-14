import type {
    BackgroundMode,
    SlideDirection,
    VariantType,
} from './slider.types';

export const sliderOptions = {
    parallax: true,
    particles: true,
    defaultVariant: 'luxury' as VariantType,
    tenantIntensity: 'medium' as 'low' | 'medium' | 'high',
    defaultDirection: 'left' as SlideDirection,
    defaultBackgroundMode: 'normal' as BackgroundMode,
};
