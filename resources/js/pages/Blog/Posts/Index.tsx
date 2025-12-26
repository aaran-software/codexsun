import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published: boolean;
    active_id: number;
    created_at: string;
    deleted_at: string | null;
    category?: {
        id: number;
        name: string;
    };
    author?: {
        id: number;
        name: string;
    };
}

interface Pagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface PageProps {
    posts: Pagination<BlogPost>;
    filters?: {
        search?: string;
        per_page?: string;
        published?: string;
    };

    can?: {
        create: boolean;
        delete: boolean;
    };
    trashedCount?: number;
}

/* ------------------------------------------------------------------ */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Blog', href: route('blog.posts.index') },
    { title: 'Posts', href: route('blog.posts.index') },
];

export default function Index() {
    const { posts, filters, can, trashedCount } =
        usePage<PageProps>().props;

    /* Safe pagination */
    const pagination: Pagination<BlogPost> = {
        data: posts?.data ?? [],
        current_page: posts?.current_page ?? 1,
        last_page: posts?.last_page ?? 1,
        from: posts?.from ?? null,
        to: posts?.to ?? null,
        total: posts?.total ?? 0,
        per_page: posts?.per_page ?? 15,
    };

    const [localSearch, setLocalSearch] = useState(filters?.search ?? '');
    const [perPage, setPerPage] = useState(filters?.per_page ?? '15');
    const [loading, setLoading] = useState(false);
    const [published, setPublished] = useState(filters?.published ?? '');

    useEffect(() => {
        setLocalSearch(filters?.search ?? '');
        setPerPage(filters?.per_page ?? '15');
        setPublished(filters?.published ?? '');
    }, [filters]);


    const navigate = useCallback(
        (extra = {}) => {
            setLoading(true);
            router.get(
                route('blog.posts.index'),
                {
                    search: localSearch || undefined,
                    per_page: perPage,
                    published: published || undefined,
                    ...extra,
                },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setLoading(false),
                },
            );
        },
        [localSearch, perPage, published],
    );



    const activeBadges = useMemo(() => {
        if (!localSearch) return null;

        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{localSearch}"
                <button
                    onClick={() => {
                        setLocalSearch('');
                        navigate({ search: undefined });
                    }}
                >
                    <X className="h-3 w-3" />
                </button>
            </Badge>
        );
    }, [localSearch, navigate]);

    return (
        <AppLayout title="Blog Posts" breadcrumb={breadcrumbs}>
            <Head title="Blog Posts" />

            <div className="px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                   <div className={"flex flex-col"}>
                       <h1 className="text-2xl font-bold text-foreground/80">Blog Posts</h1>
                       <p className={"text-sm text-foreground/50"}>List out All Articles</p>
                   </div>
                    <div className="flex items-center gap-3">
                        {trashedCount ? (
                            <Badge variant="destructive">
                                <Trash2 className="mr-1 h-3 w-3" />
                                {trashedCount} in trash
                            </Badge>
                        ) : null}

                        {can?.create && (
                            <Link href={route('blog.posts.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Post
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search title..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && navigate()
                            }
                        />
                    </div>
                    <select
                        value={published}
                        onChange={(e) => {
                            setPublished(e.target.value);
                            navigate({ published: e.target.value });
                        }}
                        className="rounded-md border px-3 py-2 text-sm bg-background text-foreground"
                    >
                        <option value="">All Status</option>
                        <option value="1">Published</option>
                        <option value="0">Inactive</option>
                    </select>


                    <select
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(e.target.value);
                            navigate({ per_page: e.target.value });
                        }}
                        className="rounded-md border px-3 py-2 text-sm bg-background text-foreground"
                    >
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>

                    <Button variant="outline" onClick={() => navigate()}>
                        <Search className="mr-2 h-4 w-4" />
                        Apply
                    </Button>

                    {localSearch && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setLocalSearch('');
                                navigate({ search: undefined });
                            }}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>

                {activeBadges}

                {/* Table */}
                <DataTable
                    data={pagination.data}
                    pagination={pagination}
                    onPageChange={(page) => navigate({ page })}
                    isLoading={loading}
                    emptyMessage="No blog posts found."
                >
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pagination.data.map((post) => (
                            <TableRow key={post.id}>
                                <TableCell className="font-medium">
                                    <Link
                                        href={route(
                                            'blog.posts.edit',
                                            post.id,
                                        )}
                                        className="hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                </TableCell>

                                <TableCell>
                                    {post.category?.name ?? '—'}
                                </TableCell>

                                <TableCell>
                                    {post.author?.name ?? '—'}
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant={
                                            post.published
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {post.published
                                            ? 'Published'
                                            : 'InActive'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {new Date(
                                        post.created_at,
                                    ).toLocaleDateString()}
                                </TableCell>

                                <TableCell className="text-right">
                                    <TableActions
                                        id={post.id}
                                        editRoute={route(
                                            'blog.posts.edit',
                                            post.id,
                                        )}
                                        deleteRoute={route(
                                            'blog.posts.destroy',
                                            post.id,
                                        )}
                                        isDeleted={!!post.deleted_at}
                                        canDelete={can?.delete}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </DataTable>
            </div>
        </AppLayout>
    );
}
