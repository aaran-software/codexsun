import { Link } from '@inertiajs/react';

export default function CategoryGrid() {
    const categories = [
        {
            name: 'T-Shirts',
            href: '/shop/tshirts',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        },
        {
            name: 'Pants',
            href: '/shop/pants',
            image: 'https://images.unsplash.com/photo-1624378440070-950c3c1c95a8',
        },
        {
            name: 'Men',
            href: '/shop/mens',
            image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f',
        },
        {
            name: 'Women',
            href: '/shop/womens',
            image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614',
        },
        {
            name: 'Kids',
            href: '/shop/kids',
            image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157',
        },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="mb-10 text-center text-3xl font-bold">
                    Wholesale Categories
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="group relative overflow-hidden rounded-xl shadow-lg"
                        >
                            <img
                                src={cat.image}
                                className="h-56 w-full object-cover transition group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {cat.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
