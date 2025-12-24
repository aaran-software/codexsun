import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

// UI
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2 } from 'lucide-react';
import TextEditor from '@/components/ui/text-editor';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface PostImage {
    id: number;
    image_path: string;
}

interface BlogPost {
    id: number;
    title: string;
    excerpt: string | null;
    body: string;
    blog_category_id: number;
    featured_image: string | null;
    published: boolean;
    images: PostImage[];
}

interface PageProps {
    post: BlogPost;
    categories: Category[];
    tags: Tag[];
    selectedTags: number[];
}

/* ------------------------------------------------------------------ */

export default function Edit() {
    const { post, categories, tags, selectedTags } =
        usePage<PageProps>().props;

    const { data, setData, post: submit, processing, errors } = useForm({
        title: post.title,
        excerpt: post.excerpt ?? '',
        body: post.body,
        blog_category_id: post.blog_category_id,
        tags: selectedTags ?? [],
        images: [] as File[],
        published: post.published,
        _method: 'put', // 👈 IMPORTANT for PATCH
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        submit(route('blog.posts.update', post.id), {
            forceFormData: true, // 👈 REQUIRED for image update
        });
    };

    return (
        <AppLayout title="Edit Blog Post">
            <Head title="Edit Blog Post" />

            <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
                        <p className="text-muted-foreground">
                            Update your blog article
                        </p>
                    </div>

                    <Button variant="ghost" asChild>
                        <Link href={route('blog.posts.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                        <CardDescription>
                            Update required fields and save changes
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2">
                                <Label>Excerpt</Label>
                                <Textarea
                                    rows={3}
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData('excerpt', e.target.value)
                                    }
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <Label>Content</Label>
                                {/*<Textarea*/}
                                {/*    rows={10}*/}
                                {/*    value={data.body}*/}
                                {/*    onChange={(e) =>*/}
                                {/*        setData('body', e.target.value)*/}
                                {/*    }*/}
                                {/*/>*/}
                                <TextEditor
                                    id="blog-body"
                                    value={data.body}
                                    onChange={(html) => setData('body', html)}
                                />
                                {errors.body && (
                                    <p className="text-sm text-destructive">
                                        {errors.body}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    value={data.blog_category_id}
                                    onChange={(e) =>
                                        setData(
                                            'blog_category_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-md border px-3 py-2"
                                >
                                    <option value="">
                                        Select category
                                    </option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.blog_category_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.blog_category_id}
                                    </p>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Tags</Label>

                                <div className="grid grid-cols-2 gap-2">
                                    {tags.map((tag) => (
                                        <label
                                            key={tag.id}
                                            className="flex items-center space-x-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.tags.includes(
                                                    tag.id,
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setData('tags', [
                                                            ...data.tags,
                                                            tag.id,
                                                        ]);
                                                    } else {
                                                        setData(
                                                            'tags',
                                                            data.tags.filter(
                                                                (id) =>
                                                                    id !==
                                                                    tag.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                            <span>{tag.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="space-y-2">
                                <Label>Featured Image</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) =>
                                        setData(
                                            'images',
                                            e.target.files ? Array.from(e.target.files) : []
                                        )
                                    }
                                />

                                {post.featured_image && (
                                    <p className="text-xs text-muted-foreground">
                                        Current image will be replaced if you
                                        upload a new one.
                                    </p>
                                )}
                                {post.images?.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {post.images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative group rounded overflow-hidden"
                                            >
                                                <img
                                                    src={`/storage/${img.image_path}`}
                                                    className="h-28 w-full object-cover"
                                                />

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Delete this image?')) {
                                                            router.delete(
                                                                route('blog.posts.images.destroy', img.id),
                                                                { preserveScroll: true }
                                                            );
                                                        }
                                                    }}

                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}


                            </div>

                            {/* Published */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={data.published}
                                    onCheckedChange={(v) =>
                                        setData('published', v)
                                    }
                                />
                                <Label>Publish immediately</Label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving...'
                                        : 'Update Post'}
                                </Button>

                                <Button variant="outline" asChild>
                                    <Link
                                        href={route('blog.posts.index')}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
