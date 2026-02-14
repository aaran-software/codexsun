import { Link } from '@inertiajs/react';

export default function ProductRange() {
    const products = [
        {
            name: 'Innerwear (Briefs & Vests)',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'innerwear',
        },
        {
            name: 'Knitted T-Shirts (Regular Fit)',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'knitted-tshirts',
        },
        {
            name: 'Knitted Full Sleeve T-Shirts',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'full-sleeve-tshirts',
        },
        {
            name: 'Casual Knitted Wear',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'casual-knit',
        },
        {
            name: 'Corporate & Promotional Knitted T-Shirts',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'corporate-knit',
        },
        {
            name: 'Woven Casual Shirts',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'woven-casual',
        },
        {
            name: 'Woven Formal Shirts',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'woven-formal',
        },
        {
            name: 'Woven Bottom Wear',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'woven-bottom',
        },
        {
            name: 'Uniform & Institutional Wear',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'uniform',
        },
        {
            name: 'Bulk & Custom Garments',
            image: '/assets/ttt/brands/brand1.png',
            slug: 'bulk-custom',
        },
    ];

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-6 text-2xl font-semibold">
                    Our Product Range
                </h2>

                <ul className="grid grid-cols-2 gap-4 text-gray-700 md:grid-cols-3">
                    {products.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={`/catalog/${item.slug}`}
                                className="group flex items-center gap-4 rounded border bg-white p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
                            >
                                {/* Small Image */}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-12 w-12 rounded object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Text */}
                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
