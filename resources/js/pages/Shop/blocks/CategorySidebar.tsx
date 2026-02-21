// resources/js/Components/Shop/CategorySidebar.tsx
import { Link } from '@inertiajs/react';

interface Category {
    id: string | number;
    name: string;
    slug: string;
    count: number;
}

interface Props {
    categories: Category[];
    activeCategory?: string;
}

export default function CategorySidebar({ categories, activeCategory }: Props) {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
                Categories
            </h3>

            <div className="space-y-1">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors ${
                            activeCategory === cat.slug
                                ? 'bg-primary/10 font-medium text-primary'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                    >
                        <span>{cat.name}</span> {/* ← only name */}
                        <span className="text-xs opacity-70">
                            ({cat.count}) {/* ← only count */}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
