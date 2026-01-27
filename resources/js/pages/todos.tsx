import { Head } from '@inertiajs/react'
import Layout from '@/layouts/app-layout'

export default function todos() {
    return (
        <Layout>
            <Head title="todos" />
            <div className="mx-auto bg-green-500 p-3 py-20 text-5xl text-white">
                todos
            </div>
        </Layout>
    );
}
