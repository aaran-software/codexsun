import { Head } from '@inertiajs/react';

export default function Category({ category }: { category: string }) {
    return (
        <>
            <Head title={`${category} Catalog`} />

            <div className="container mx-auto px-4 py-20">
                <h1 className="text-3xl font-semibold capitalize">
                    {category} Collection
                </h1>

                <p className="mt-3 text-gray-600">
                    Bulk hosiery garments directly sourced from Tirupur
                    manufacturers.
                </p>
            </div>
        </>
    );
}
