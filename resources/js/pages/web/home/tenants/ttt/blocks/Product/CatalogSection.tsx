import { catalogCategories } from '../catalogData';
import CatalogCard from './CatalogCard';

export default function CatalogSection() {
    return (
        <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 max-w-3xl">
                    <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                        Complete Hosiery Garment Catalog
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Tirupur-manufactured garments for men, women, kids and
                        infants — suitable for wholesale, retail and corporate
                        bulk orders.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {catalogCategories.map((category) => (
                        <CatalogCard key={category.slug} {...category} />
                    ))}
                </div>
            </div>
        </section>
    );
}
