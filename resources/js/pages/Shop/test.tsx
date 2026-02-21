// resources/js/Pages/Shop.tsx (temporary debug version)
import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import { useCurrentTenant } from '@/lib/tenant';
import CategorySidebar from './blocks/CategorySidebar';
import ProductGrid from './blocks/ProductGrid';

interface Props {
    categories: any[]; // temporary any to see real shape
    products: any[]; // temporary any
    filters: {
        category?: string;
        sort: string;
        page: number;
    };
}

export default function Shop({ categories, products, filters }: Props) {
    const tenant = useCurrentTenant();

    // ─── DEBUG PRINT ───────────────────────────────────────────────
    // This will show EXACTLY what Laravel sent us
    return (
        <WebLayout>
            <Head title={`Shop Debug - ${tenant?.displayName || 'Unknown'}`} />

            <div className="min-h-screen bg-background p-8">
                {/* Banner */}
                <div className="mb-12 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-10 text-center">
                    <h1 className="text-4xl font-bold md:text-5xl">
                        Debug: Shop Page Data
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Check browser console or page content below to see raw
                        data from backend
                    </p>
                </div>

                {/* Raw Categories */}
                <div className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Raw Categories (from backend)
                    </h2>
                    <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                        {JSON.stringify(categories, null, 2)}
                    </pre>
                </div>

                {/* Raw Products */}
                <div className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Raw Products (first 3 only)
                    </h2>
                    <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                        {JSON.stringify(products.slice(0, 3), null, 2)}
                    </pre>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Showing only first 3 — total: {products.length}
                    </p>
                </div>

                {/* Normal content (commented out to isolate issue) */}
                {/* <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                        <CategorySidebar categories={categories} activeCategory={filters.category} />
                    </div>
                    <div className="lg:col-span-9">
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <h2 className="text-2xl font-bold text-foreground">
                                {filters.category
                                    ? categories.find((c) => c.slug === filters.category)?.name || 'All Products'
                                    : 'All Products'}
                            </h2>
                            <select
                                defaultValue={filters.sort}
                                className="min-w-[180px] rounded-lg border bg-card px-4 py-2.5 text-sm"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                        <ProductGrid products={products} />
                    </div>
                </div> */}
            </div>
        </WebLayout>
    );
}
