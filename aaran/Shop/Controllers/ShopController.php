<?php

namespace Aaran\Shop\Controllers;

use Aaran\Shop\Models\Category;
use Aaran\Shop\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        // Categories - FORCE plain array
        $categoriesQuery = Category::query()
            ->active()
            ->orderBy('display_order')
            ->orderBy('name')
            ->withCount('products');

        $categoriesCollection = $categoriesQuery->get();

        $categories = $categoriesCollection->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->products_count,
            ];
        })->toArray();

        // Products - FORCE plain array
        $query = Product::query()
            ->with('category')
            ->when($request->category, function ($q) use ($request) {
                $q->whereHas('category', fn ($qc) => $qc->where('slug', $request->category));
            })
            ->when($request->sort === 'price-low', fn ($q) => $q->orderBy('price'))
            ->when($request->sort === 'price-high', fn ($q) => $q->orderByDesc('price'))
            ->when($request->sort === 'newest', fn ($q) => $q->latest())
            ->when($request->sort === 'featured', fn ($q) => $q->where('is_featured', true))
            ->latest();

        $paginator = $query->paginate(12);

        $products = collect($paginator->items())->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'originalPrice' => $product->original_price,
                'image' => $product->image,
                'category' => $product->category?->name ?? 'Uncategorized',
                'inStock' => $product->in_stock,
                'rating' => $product->rating,
                'reviewCount' => $product->review_count,
                'badge' => $product->badge,
            ];
        })->toArray();

        return Inertia::render('Shop/index', [
            'categories' => $categories,
            'products' => $products,
            'filters' => [
                'category' => $request->query('category'),
                'sort' => $request->query('sort', 'featured'),
                'page' => $paginator->currentPage(),
            ],
        ]);
    }
}
