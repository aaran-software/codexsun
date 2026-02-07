export default function ProductRange() {
    const products = [
        'Innerwear',
        'Casual Wear',
        'Regular T-Shirts',
        'Corporate T-Shirts',
        'Bulk & Custom Garments',
    ];

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-6 text-2xl font-semibold">
                    Our Product Range
                </h2>

                <ul className="grid grid-cols-2 gap-4 text-gray-700 md:grid-cols-3">
                    {products.map((item, index) => (
                        <li key={index} className="rounded border p-4">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
