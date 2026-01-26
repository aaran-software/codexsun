import { Head } from '@inertiajs/react'
import WebLayout from '@/layouts/web-layout';

export default function index() {
    return (
        <WebLayout>
            <Head title="Home" />
            <div className="bg-blue-500 mx-auto p-3 py-20 text-5xl text-orange-400">
                Home
            </div>
        </WebLayout>
    );
}
