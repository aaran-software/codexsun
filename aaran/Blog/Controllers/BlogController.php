<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogCategory;
use Aaran\Blog\Models\BlogTag;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $blogs = BlogPost::query()
            ->where('published', true)
            ->with(['category', 'author'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($post) {
                return [
                    'id'       => $post->id,
                    'title'    => $post->title,
                    'slug'     => $post->slug,
                    'excerpt'  => $post->excerpt,
                    'image'    => $post->featured_image ? asset($post->featured_image) : null,
                    'author'   => $post->author?->name ?? 'Editorial Team',
                    'date'     => $post->created_at->format('M d, Y'),
                    'category' => $post->category?->name ?? 'Uncategorized',
                ];
            });

        // Fallback to dummy if empty (useful during initial development)
        if ($blogs->isEmpty()) {
            $blogs = $this->getFallbackDummyBlogs();
        }

        return Inertia::render('web/blog/index', [
            'blogs'   => $blogs,
            'sidebar' => $this->getSidebarData(),
        ]);
    }

    public function show(string $slug)
    {
        $blog = BlogPost::query()
            ->where('slug', $slug)
            ->where('published', true)
            ->with(['category', 'author'])
            ->firstOrFail();

        $data = [
            'id'           => $blog->id,
            'title'        => $blog->title,
            'slug'         => $blog->slug,
            'excerpt'      => $blog->excerpt,
            'content'      => $blog->body,
            'image'        => $blog->featured_image ? asset($blog->featured_image) : null,
            'author'       => $blog->author?->name ?? 'Editorial Team',
            'date'         => $blog->created_at->format('M d, Y'),
            'category'     => $blog->category?->name ?? 'Uncategorized',
            'reading_time' => $blog->reading_time,
            'tags'         => $blog->meta_keywords
                ? array_map('trim', explode(',', $blog->meta_keywords))
                : [],
            // Future: 'meta_description' => $blog->meta_description ?? $blog->excerpt,
        ];

        return Inertia::render('web/blog/show', [
            'blog'    => $data,
            'sidebar' => $this->getSidebarData(),
        ]);
    }

    // ────────────────────────────────────────────────
    // New method: shared sidebar data for blog pages
    // ────────────────────────────────────────────────
    private function getSidebarData(): array
    {
        // Optional: apply tenant scope if you're using multi-tenancy package
        // $tenantId = tenant()?->id ?? null;

        $categories = BlogCategory::query()
            // ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->withCount(['posts' => fn($q) => $q->where('published', true)])
            ->orderBy('name')
            ->get()
            ->map(fn($cat) => [
                'name'  => $cat->name,
                'slug'  => $cat->slug,
                'count' => $cat->posts_count ?? 0,
            ]);

        $popular_tags = BlogTag::query()
            // ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->withCount('posts')
            ->orderByDesc('posts_count')
            ->take(12)                  // show more popular tags
            ->get()
            ->map(fn($tag) => [
                'name' => $tag->name,
                'slug' => $tag->slug ?? Str::slug($tag->name),
            ]);

        $recent_posts = BlogPost::query()
            ->where('published', true)
            // ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->with('category')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($post) => [
                'title'   => $post->title,
                'slug'    => $post->slug,
                'image'   => $post->featured_image ? asset($post->featured_image) : '/assets/placeholder-blog.jpg',
                'excerpt' => Str::limit($post->excerpt, 60),
            ]);

        return compact('categories', 'popular_tags', 'recent_posts');
    }

    // Optional fallback dummy blogs (keep for dev/testing)
    private function getFallbackDummyBlogs(): array
    {
        return [
            [
                'id'       => 999,
                'title'    => 'Sample Post – Database is empty',
                'slug'     => 'sample-post',
                'excerpt'  => 'Create your first blog post in the admin panel!',
                'image'    => asset('assets/ttt/blog/blog.jpg'),
                'author'   => 'System',
                'date'     => now()->format('M d, Y'),
                'category' => 'Getting Started',
            ],
        ];
    }
}
