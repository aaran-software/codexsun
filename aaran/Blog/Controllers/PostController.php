<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogCategory;
use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogTag;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = BlogPost::with(['category', 'author'])
            ->orderByDesc('created_at');

        // 🔍 Search
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // ✅ Active / Inactive (Published / Draft)
        if ($request->filled('published')) {
            $query->where('published', (bool) $request->published);
        }

        $perPage = $request->get('per_page', 15);

        $posts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Blog/Posts/Index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'per_page', 'published']),
            'can' => [
                'create' => true,
                'delete' => true,
            ],
            'trashedCount' => BlogPost::onlyTrashed()->count(),
        ]);
    }



    public function create(): Response
    {
        $categories = BlogCategory::where('active_id', 1)->orderBy('name')->get();
        $tags = BlogTag::where('active_id', 1)->orderBy('name')->get();

        return Inertia::render('Blog/Posts/Create', [
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    private function generateUniqueSlug(string $title): string
    {
        $slug = \Illuminate\Support\Str::slug($title);
        $original = $slug;
        $count = 1;

        while (\Aaran\Blog\Models\BlogPost::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$count}";
            $count++;
        }

        return $slug;
    }


    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'required|string',
            'blog_category_id' => 'required|exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'published' => 'boolean',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'meta_keywords' => ['nullable', 'array'],
            'meta_keywords.*' => ['string', 'max:50'],
        ]);
        $data['meta_keywords'] = collect($data['meta_keywords'] ?? [])
            ->map(fn ($k) => trim(strtolower($k)))
            ->unique()
            ->values()
            ->toArray();

        // ✅ Create post ONCE
        $post = BlogPost::create([
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'blog_category_id' => $data['blog_category_id'],
            'slug' => $this->generateUniqueSlug($data['title']),
            'user_id' => Auth::id(),
            'meta_keywords' => $data['meta_keywords'] ?? [],
            'published' => $data['published'] ?? true,
            'active_id' => 1,
        ]);

        // 📸 Handle images
        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('blog/images', 'public');

            // ⭐ First image = featured image
            if ($index === 0) {
                $post->update([
                    'featured_image' => $path,
                ]);
            }

            // 📷 Save gallery image
            $post->images()->create([
                'image_path' => $path,
                'sort_order' => $index,
            ]);
        }

        // 🔖 Attach tags
        if (!empty($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return redirect()
            ->route('blog.posts.index')
            ->with('success', 'Blog post created successfully.');
    }


    public function edit(BlogPost $post): Response
    {
        $post->load(['tags', 'images']);

        $categories = BlogCategory::where('active_id', 1)->orderBy('name')->get();
        $tags = BlogTag::where('active_id', 1)->orderBy('name')->get();

        return Inertia::render('Blog/Posts/Edit', [
            'post' => $post,
            'categories' => $categories,
            'tags' => $tags,
            'selectedTags' => $post->tags->pluck('id')->toArray(),
        ]);
    }

    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'required|string',
            'blog_category_id' => 'required|exists:blog_categories,id',
            'tags' => 'array',
            'tags.*' => 'exists:blog_tags,id',
            'published' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'meta_keywords' => ['nullable', 'array'],
            'meta_keywords.*' => ['string', 'max:50'],
        ]);

        $data['meta_keywords'] = collect($data['meta_keywords'] ?? [])
            ->map(fn ($k) => trim(strtolower($k)))
            ->unique()
            ->values()
            ->toArray();

        // Update post fields
        $post->update([
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'blog_category_id' => $data['blog_category_id'],
            'published' => $data['published'] ?? $post->published,
            'slug' => Str::slug($data['title']),
            'meta_keywords' => $data['meta_keywords'] ?? $post->meta_keywords,
        ]);

        // 📸 Add NEW images (do NOT delete old ones)
        if ($request->hasFile('images')) {
            $startIndex = $post->images()->count();

            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('blog/images', 'public');

                // ⭐ If no featured image, set first uploaded
                if (!$post->featured_image) {
                    $post->update(['featured_image' => $path]);
                }

                $post->images()->create([
                    'image_path' => $path,
                    'sort_order' => $startIndex + $index,
                ]);
            }
        }

        // Sync tags
        $post->tags()->sync($request->tags ?? []);

        return redirect()
            ->route('blog.posts.index')
            ->with('success', 'Blog post updated successfully.');
    }



    public function destroy(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return redirect()->route('blog.posts.index')->with('success', 'Blog post deleted successfully.');
    }


    public function articles(Request $request): Response
    {
        $query = BlogPost::with(['category', 'author'])
            ->orderByDesc('created_at');

        // 🔍 Search
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // ✅ Active / Inactive (Published / Draft)
        if ($request->filled('published')) {
            $query->where('published', (bool) $request->published);
        }

        $perPage = $request->get('per_page', 15);

        $posts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Blog/Web/Articles', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'per_page', 'published']),
            'can' => [
                'create' => true,
                'delete' => true,
            ],
            'trashedCount' => BlogPost::onlyTrashed()->count(),
        ]);
    }

    public function post(string $slug): \Inertia\Response
    {
        $post = BlogPost::where('slug', $slug)
            ->where('published', true)
            ->with([
                'category',
                'author',
                'tags',
                'images',
                'comments.user',
                'likes',
            ])
            ->firstOrFail();

        $recentPosts = BlogPost::where('id', '!=', $post->id)
            ->where('published', true)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'slug', 'featured_image', 'created_at', 'user_id'])
            ->load('author');

        return Inertia::render('Blog/Web/Post', [
            'post' => [
                ...$post->toArray(),
                'likes_count' => $post->likes()->where('liked', true)->count(),
                'liked' => auth()->check()
                    ? $post->likedByUser(auth()->id())
                    : false,
            ],
            'recentPosts' => $recentPosts,
        ]);
    }

}
