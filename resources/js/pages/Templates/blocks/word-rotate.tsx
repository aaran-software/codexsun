// resources/js/pages/admin/Index.tsx
import { Head } from '@inertiajs/react';

import { WordRotate } from '@/components/ui/word-rotate';
import AppLayout from '@/layouts/app-layout';

export default function Index() {
    return (
        <AppLayout>
            <Head title="Index" />

            <div className="p-10">
                <WordRotate
                    words={['Sundar', 'Admin', 'Tenant', 'Dashboard']}
                    duration={1800}
                    className="text-5xl font-bold text-primary"
                />
            </div>




        </AppLayout>
    );
}
