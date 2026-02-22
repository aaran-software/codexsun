// resources/js/utils/helper/format.ts

/**
 * Formats a number as Indian Rupee currency with space after ₹
 * Examples:
 *   formatCurrency(124999)     → "₹ 1,24,999"
 *   formatCurrency(124999.5, 2) → "₹ 1,24,999.50"
 *   formatCurrency(0)          → "₹ 0"
 */
export function formatCurrency(
    amount: number | string | null | undefined,
    decimals: number = 0
): string {
    // Handle null/undefined/empty
    if (amount == null || amount === '') {
        return '₹ 0';
    }

    // Convert to number safely
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    if (isNaN(num)) {
        return '₹ 0';
    }

    // Use Intl.NumberFormat with Indian locale (en-IN)
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    // Intl gives "₹1,24,999" → we replace "₹" with "₹ " (add space)

    return formatter.format(num).replace(/^₹/, '₹ ');
}

export function formatCompactCurrency(
    amount: number | string | null | undefined,
): string {
    if (amount == null || amount === '') return '₹ 0';

    const num =
        typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(num)) return '₹ 0';

    if (num >= 10000000) {
        return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
        return `₹ ${(num / 100000).toFixed(1)} L`;
    }
    if (num >= 1000) {
        return `₹ ${(num / 1000).toFixed(1)} K`;
    }

    return formatCurrency(num);
}

// Usage examples:
// formatCurrency(124999)         → "₹ 1,24,999"
// formatCurrency(124999.5, 2)    → "₹ 1,24,999.50"
// formatCompactCurrency(1250000) → "₹ 12.5 L"
