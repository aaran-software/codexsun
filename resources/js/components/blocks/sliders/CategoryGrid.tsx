import { Link } from '@inertiajs/react';

export default function CategoryGrid() {
    const categories = [
        {
            name: 'Men',
            href: '/shop/mens',
            image: '/assets/ttt/categories/men.jpg',
        },
        {
            name: 'Women',
            href: '/shop/womens',
            image: '/assets/ttt/categories/women.png',
        },
        {
            name: 'Boys',
            href: '/shop/boys',
            image: '/assets/ttt/categories/boy.png',
        },
        {
            name: 'Girls',
            href: '/shop/girls',
            image: '/assets/ttt/categories/girl.png',
        },
        {
            name: 'Kids',
            href: '/shop/kids',
            image: '/assets/ttt/categories/infant.jpg',
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
                                className="h-56 w-full object-cover sm:object-fill transition group-hover:scale-110"
                                alt={cat.name}
                            />
                            <div className="absolute inset-0 bg-black/20" />
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
