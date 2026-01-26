import WebLayout from '@/layouts/web-layout';
import { Head } from '@inertiajs/react';

export default function index() {
    return (
        <WebLayout>
            <Head title="About us" />
            <div className="mx-auto bg-blue-500 p-3 py-20 text-5xl text-orange-400">
                about us
            </div>
        </WebLayout>
    );
}
