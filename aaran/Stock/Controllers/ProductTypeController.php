<?php

namespace Aaran\Stock\Controllers;

use Aaran\Stock\Models\ProductType;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Inertia\Response;

class ProductTypeController extends Controller
{
    public function index(): Response
    {
        $product_types = ProductType::orderBy('name')->paginate(20);

        return Inertia::render('Stock/ProductTypes/Index', [
            'product_types' => $product_types,
            'can' => [
                'create' => true,
                'delete' => true,
            ],
            'trashedCount' => ProductType::onlyTrashed()->count(),
            'filters' => request()->only(['search', 'active_filter', 'per_page']),
        ]);
    }


    public function create(): Response
    {
        return Inertia::render('Stock/ProductTypes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags',
        ]);

        ProductType::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'active_id' => 1,
        ]);

        return redirect()->route('blog.tags.index')->with('success', 'Tag created successfully.');
    }

    public function edit(ProductType $tag): Response
    {
        return Inertia::render('Stock/ProductTypes/Edit', [
            'tag' => $tag
        ]);
    }

    public function update(Request $request, ProductType $tag): RedirectResponse
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

    public function destroy(ProductType $tag): RedirectResponse
    {
        $tag->delete();

        return redirect()->route('blog.tags.index')->with('success', 'Tag deleted successfully.');
    }
}
