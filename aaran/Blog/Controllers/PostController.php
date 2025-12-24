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

    public function store(Request $request): RedirectResponse
    {
        $data =  $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'required|string',
            'blog_category_id' => 'required|exists:blog_categories,id',
            'tags' => 'array',
            'tags.*' => 'exists:blog_tags,id',
            'published' => 'boolean',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max
        ]);

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('blog/featured', 'public');
        }

        $data['slug'] = Str::slug($data['title']);
        $data['user_id'] = Auth::id();
        $data['active_id'] = 1;

        $post = BlogPost::create($data);

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }


        return redirect()->route('blog.posts.index')->with('success', 'Blog post created successfully.');
    }

    public function edit(BlogPost $post): Response
    {
        $post->load('tags');

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
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // 📸 Image update
        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }

            $data['featured_image'] = $request->file('featured_image')
                ->store('blog/featured', 'public');
        }

        // 🔗 Update slug
        $data['slug'] = Str::slug($data['title']);

        // ✅ THIS WAS MISSING
        $post->update($data);

        // 🔖 Sync tags
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

    public function post(BlogPost $post): \Inertia\Response
    {
        $post->load([
            'category',
            'author',
            'tags',
            'comments.user',
        ]);

        $recentPosts = BlogPost::where('id', '!=', $post->id)
            ->where('published', true)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'slug', 'featured_image', 'created_at', 'user_id'])
            ->load('author');

        return Inertia::render('Blog/Web/Post', [
            'post' => $post,
            'recentPosts' => $recentPosts,
        ]);
    }



}
