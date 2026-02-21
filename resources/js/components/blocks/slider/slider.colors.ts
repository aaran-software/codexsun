// slider.colors.ts
import type { HighlightVariant, CTAColor } from './slider.types';

export const getHighlightClasses = (variant?: HighlightVariant) => {
    switch (variant) {
        case 'primary':
            return 'bg-blue-600/90 text-white';
        case 'secondary':
            return 'bg-gray-600/90 text-white';
        case 'success':
            return 'bg-green-600/90 text-white';
        case 'warning':
            return 'bg-yellow-500/90 text-black';
        case 'danger':
            return 'bg-red-600/90 text-white';
        case 'glass':
            return 'bg-white/20 backdrop-blur text-white';
        default:
            return 'bg-white/20 text-white';
    }
};

export const getCTAColorClasses = (color?: CTAColor) => {
    switch (color) {
        case 'primary':
            return 'bg-blue-600 hover:bg-blue-700 text-white';
        case 'secondary':
            return 'bg-gray-600 hover:bg-gray-700 text-white';
        case 'success':
            return 'bg-green-600 hover:bg-green-700 text-white';
        case 'warning':
            return 'bg-yellow-500 hover:bg-yellow-600 text-black';
        case 'danger':
            return 'bg-red-600 hover:bg-red-700 text-white';
        case 'dark':
            return 'bg-black hover:bg-neutral-800 text-white';
        case 'light':
            return 'bg-white hover:bg-gray-200 text-black';
        default:
            return 'bg-white text-black hover:bg-gray-200';
    }
};
