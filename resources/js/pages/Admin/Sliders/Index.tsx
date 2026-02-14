import { Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { sliders } = usePage().props as any;

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">Sliders</h1>

            <Link
                href={route('admin.sliders.create')}
                className="rounded bg-green-600 px-4 py-2 text-white"
            >
                Create Slider
            </Link>

            <table className="mt-6 w-full border">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Tenant</th>
                        <th>Order</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sliders.data.map((slider: any) => (
                        <tr key={slider.id}>
                            <td>{slider.title}</td>
                            <td>{slider.tenant?.name}</td>
                            <td>{slider.order}</td>
                            <td>
                                <Link
                                    href={route(
                                        'admin.sliders.edit',
                                        slider.id,
                                    )}
                                    className="text-blue-500"
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
