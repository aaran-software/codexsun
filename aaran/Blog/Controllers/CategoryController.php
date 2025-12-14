<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = BlogCategory::orderBy('name')->paginate(15);

        return Inertia::render('Blog/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Blog/Categories/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories',
        ]);

        BlogCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'active_id' => 1,
        ]);

        return redirect()->route('blog.categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(BlogCategory $category): Response
    {
        return Inertia::render('Blog/Categories/Edit', [
            'category' => $category
        ]);
    }

    public function update(Request $request, BlogCategory $category): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name,' . $category->id,
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return redirect()->route('blog.categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(BlogCategory $category): RedirectResponse
    {
        $category->delete();

        return redirect()->route('blog.categories.index')->with('success', 'Category deleted successfully.');
    }
}
