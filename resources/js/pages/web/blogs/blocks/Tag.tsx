import { Head, Link } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import WebLayout from '@/layouts/web-layout';

export default function BlogTag({ tag, blogs }: any) {
    return (
        <WebLayout>
            <Head title={`#${tag} Articles`} />

            <section className="bg-[#f7f7f7] py-24">
                <div className="container mx-auto px-4">
                    <h1 className="mb-12 text-3xl font-semibold">
                        Articles tagged with “{tag}”
                    </h1>

                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                        {blogs.map((blog: any) => (
                            <Link
                                key={blog.id}
                                href={`/blog/${blog.id}`}
                                className="rounded-xl bg-white p-6 transition hover:shadow-lg"
                            >
                                <h3 className="mb-2 font-semibold">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {blog.excerpt}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <FooterCard />
        </WebLayout>
    );
}
