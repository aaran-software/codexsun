// resources/js/Components/Shop/ProductGrid.tsx
import ProductCard from './ProductCard';

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
    badge?: string | null;
};

interface Props {
    products: Product[]; // now guaranteed to be array
}

export default function ProductGrid({ products = [] }: Props) {
    if (products.length === 0) {
        return (
            <div className="py-20 text-center text-muted-foreground">
                No products found in this category.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
