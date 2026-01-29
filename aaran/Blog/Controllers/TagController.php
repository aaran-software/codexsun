<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogTag;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Inertia\Response;

class TagController extends Controller
{
    public function index(): Response
    {
        $tags = BlogTag::orderBy('name')->paginate(20);

        return Inertia::render('Blog/Tags/Index', [
            'tags' => $tags,
            'can' => [
                'create' => true,
                'delete' => true,
            ],
            'trashedCount' => BlogTag::onlyTrashed()->count(),
            'filters' => request()->only(['search', 'active_filter', 'per_page']),
        ]);
    }


    public function create(): Response
    {
        return Inertia::render('Blog/Tags/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags',
        ]);

        BlogTag::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'active_id' => 1,
        ]);

        return redirect()->route('blog.tags.index')->with('success', 'Tag created successfully.');
    }

    public function edit(BlogTag $tag): Response
    {
        return Inertia::render('Blog/Tags/Edit', [
            'tag' => $tag
        ]);
    }

    public function update(Request $request, BlogTag $tag): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags,name,' . $tag->id,
            'active_id' => 'required|integer|in:0,1',
        ]);


        $tag->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'active_id' => (int) $request['active_id'],
        ]);

        return redirect()->route('blog.tags.index')->with('success', 'Tag updated successfully.');
    }

    public function destroy(BlogTag $tag): RedirectResponse
    {
        $tag->delete();

        return redirect()->route('blog.tags.index')->with('success', 'Tag deleted successfully.');
    }
}
