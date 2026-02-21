// resources/js/Pages/Shop.tsx
import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import { useCurrentTenant } from '@/lib/tenant';
import CategorySidebar from './blocks/CategorySidebar';
import ProductGrid from './blocks/ProductGrid';

interface Props {
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        count: number;
    }>;
    products: Array<{
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
        badge?: string;
    }>;
    filters: {
        category?: string;
        sort: string;
        page: number;
    };
}

export default function Shop({ categories, products, filters }: Props) {
    const tenant = useCurrentTenant(); // ← get tenant data from hook

    return (
        <>
            <WebLayout>
                <Head title={`Shop - ${tenant.displayName}`} />

                <MenuBackdrop
                    image="/assets/techmedia/repair.jpg"
                    title="Tech media Retails"
                    subtitle="Online shopping"
                />

                <div className="min-h-screen bg-background">
                    <div className="mx-auto px-6 py-10 md:py-12">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Sidebar */}
                            <div className="lg:col-span-3">
                                <CategorySidebar
                                    categories={categories}
                                    activeCategory={filters.category}
                                />
                            </div>

                            {/* Main content */}
                            <div className="lg:col-span-9">
                                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {filters.category
                                            ? categories.find(
                                                  (c) =>
                                                      c.slug ===
                                                      filters.category,
                                              )?.name || 'All Products'
                                            : 'All Products'}
                                    </h2>

                                    <select
                                        defaultValue={filters.sort}
                                        className="min-w-45 rounded-lg border bg-card px-4 py-2.5 text-sm"
                                    >
                                        <option value="featured">
                                            Featured
                                        </option>
                                        <option value="price-low">
                                            Price: Low to High
                                        </option>
                                        <option value="price-high">
                                            Price: High to Low
                                        </option>
                                        <option value="newest">
                                            Newest First
                                        </option>
                                    </select>
                                </div>

                                <ProductGrid products={products} />
                            </div>
                        </div>
                    </div>
                </div>
            </WebLayout>
        </>
    );
}
