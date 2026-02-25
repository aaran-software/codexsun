<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        // Optional: Add policy authorization like ServiceInward
        // $this->authorize('viewAny', BlogCategory::class);

        $perPage = (int) $request->input('per_page', 50);
        $perPage = in_array($perPage, [25, 50, 100]) ? $perPage : 50;

        $query = BlogCategory::query();

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('slug', 'like', '%'.$request->search.'%');
        }

        // Active status filter
        if ($request->active_filter === 'active') {
            $query->where('active_id', 1);
        } elseif ($request->active_filter === 'inactive') {
            $query->where('active_id', '!=', 1);
        }

        $categories = $query->orderBy('name')->paginate($perPage)->withQueryString();

        // Optional: Add posts count (uncomment if you have withCount in model or here)
        // $categories->loadCount('posts');

        return Inertia::render('Blog/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'active_filter', 'per_page']),
            'can' => [
                'create' => Gate::allows('create', BlogCategory::class) ?? true, // Adjust with your policy
                'delete' => Gate::allows('delete', BlogCategory::class) ?? true,
            ],
            'trashedCount' => BlogCategory::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        // $this->authorize('create', BlogCategory::class);

        return Inertia::render('Blog/Categories/Create');
    }

    public function store(Request $request)
    {
        // $this->authorize('create', BlogCategory::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories',
        ]);

        BlogCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'active_id' => 1,
        ]);

        return redirect()->route('blog.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(BlogCategory $category)
    {
        // $this->authorize('update', $category);

        return Inertia::render('Blog/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, BlogCategory $category)
    {
        // $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name,'.$category->id,
            'active_id' => 'required|integer|in:0,1',
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'active_id' => (int) $validated['active_id'],
        ]);

        return redirect()->route('blog.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(BlogCategory $category)
    {
        // $this->authorize('delete', $category);

        $category->delete();

        return redirect()->route('blog.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    // Optional: Restore from trash
    public function restore($id)
    {
        $category = BlogCategory::withTrashed()->findOrFail($id);
        // $this->authorize('restore', $category);

        $category->restore();

        return redirect()->route('blog.categories.index')
            ->with('success', 'Category restored successfully.');
    }

    // Optional: Force delete
    public function forceDelete($id)
    {
        $category = BlogCategory::withTrashed()->findOrFail($id);
        // $this->authorize('forceDelete', $category);

        $category->forceDelete();

        return redirect()->route('blog.categories.index')
            ->with('success', 'Category permanently deleted.');
    }
}
