import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import TextEditor from '@/components/ui/text-editor';

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface PageProps {
    categories: Category[];
    tags: Tag[];
}

export default function Create() {
    const page = usePage<PageProps>();

    const categories = page.props.categories ?? [];
    const tags = page.props.tags ?? [];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        body: '',
        blog_category_id: '',
        tags: [] as number[],
        featured_image: null as File | null,
        published: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('blog.posts.store'), {
            forceFormData: true, // IMPORTANT for file upload
        });
    };

    return (
        <AppLayout title="Create Blog Post">
            <Head title="Create Blog Post" />

            <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Blog Post</h1>
                        <p className="text-muted-foreground">
                            Add a new blog article
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
                            Fill all required fields to publish your post
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2">
                                <Label>Excerpt</Label>
                                <Textarea
                                    rows={3}
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <Label>Content</Label>
                                {/*<Textarea*/}
                                {/*    rows={10}*/}
                                {/*    value={data.body}*/}
                                {/*    onChange={(e) => setData('body', e.target.value)}*/}
                                {/*/>*/}

                                <TextEditor
                                    id="blog-body"
                                    value={data.body}
                                    onChange={(html) => setData('body', html)}
                                />

                                {errors.body && (
                                    <p className="text-sm text-destructive">{errors.body}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="blog_category_id">Category</Label>
                                <select
                                    id="blog_category_id"
                                    value={data.blog_category_id}
                                    onChange={(e) => setData('blog_category_id', Number(e.target.value))}
                                    className="w-full rounded-md border px-3 py-2"
                                    required
                                >
                                    <option value="">Select category</option>

                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
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
                                                value={tag.id}
                                                checked={data.tags.includes(tag.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setData('tags', [...data.tags, tag.id]);
                                                    } else {
                                                        setData(
                                                            'tags',
                                                            data.tags.filter((id) => id !== tag.id)
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
                                    onChange={(e) =>
                                        setData(
                                            'featured_image',
                                            e.target.files ? e.target.files[0] : null,
                                        )
                                    }
                                />
                                {errors.featured_image && (
                                    <p className="text-sm text-destructive">
                                        {errors.featured_image}
                                    </p>
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
                                    {processing ? 'Saving...' : 'Create Post'}
                                </Button>

                                <Button variant="outline" asChild>
                                    <Link href={route('blog.posts.index')}>
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
