import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';

export default function index() {
    return (
        <WebLayout>
            <Head title="About us" />
            <div className="mx-auto bg-blue-500 p-3 py-20 text-5xl text-orange-400">
                services
            </div>
        </WebLayout>
    );
}
