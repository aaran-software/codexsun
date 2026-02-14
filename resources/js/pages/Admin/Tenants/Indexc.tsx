import { Link, usePage } from '@inertiajs/react'
import { useRoute } from 'ziggy-js';

export default function Index() {
    const { tenants } = usePage().props as any
    const route = useRoute();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tenants</h1>

            <Link
                href={route('admin.tenants.create')}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Create Tenant
            </Link>

            <table className="w-full mt-6 border">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Domain</th>
                    <th>Industry</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {tenants.data.map((tenant: any) => (
                    <tr key={tenant.id}>
                        <td>{tenant.name}</td>
                        <td>{tenant.domain}</td>
                        <td>{tenant.industry}</td>
                        <td>
                            <Link
                                href={route('admin.tenants.edit', tenant.id)}
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
    )
}
