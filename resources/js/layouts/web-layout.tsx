import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { SharedProps } from '@/types/web';

interface Props {
    children: ReactNode;
}

export default function WebLayout({ children }: Props) {
    const { tenant } = usePage<SharedProps>().props;

    return (
        <>
            <header className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            {tenant?.logo ? (
                                <img
                                    src={tenant.logo}
                                    alt={tenant.name}
                                    className="h-8 w-auto"
                                />
                            ) : (
                                <span className="text-xl font-bold">
                                    {tenant?.short_name ||
                                        tenant?.name ||
                                        'Aaran'}
                                </span>
                            )}
                            {tenant && (
                                <span className="text-sm text-gray-500">
                                    {tenant.name}
                                </span>
                            )}
                        </div>

                        {/* example: tenant-aware actions */}
                        <div className="flex items-center gap-4">
                            {tenant ? (
                                <span className="text-sm text-gray-600">
                                    Serving tenant: {tenant.name}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500">
                                    Global site
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            {/* optional footer with tenant info */}
            <footer className="mt-auto border-t bg-gray-50 py-6">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
                    {tenant ? (
                        <>
                            © {new Date().getFullYear()} {tenant.name}
                        </>
                    ) : (
                        <>© {new Date().getFullYear()} Aaran CMS</>
                    )}
                </div>
            </footer>
        </>
    );
}
