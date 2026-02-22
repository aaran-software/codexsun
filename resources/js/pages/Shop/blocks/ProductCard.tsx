// resources/js/Components/Product/ProductCard.tsx
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/utils/formatCurrency';

type Product = {
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
    badge?: 'New' | 'Hot' | 'Sale' | null;
};

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
            {/* Image */}
            <div className="relative aspect-4/3 overflow-hidden bg-muted/30">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {product.badge && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                        {product.badge}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-1 text-xs text-muted-foreground">
                    {product.category}
                </div>
                <h3 className="mb-2 line-clamp-2 text-base leading-tight font-medium transition-colors group-hover:text-primary">
                    {product.name}
                </h3>

                <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                        {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.originalPrice)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs">
                    {product.inStock ? (
                        <span className="font-medium text-green-600">
                            In Stock
                        </span>
                    ) : (
                        <span className="font-medium text-destructive">
                            Out of Stock
                        </span>
                    )}

                    {product.rating && (
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
