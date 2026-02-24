<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Menu;
use Aaran\Tenant\Models\SubMenu;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubMenuController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SubMenu::query()
            ->with('menu:id,title')
            ->orderBy('menu_id')
            ->orderBy('position');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('feature_key', 'like', "%{$search}%")
                    ->orWhereHas('menu', function ($sub) use ($search) {
                        $sub->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        $perPage = $request->input('per_page', 25);

        return Inertia::render('Admin/SubMenus/Index', [
            'sub_menus' => $query
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),

            'filters' => $request->only(['search', 'status', 'per_page']),

            'menus' => Menu::select('id', 'title')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => ['required', 'exists:menus,id'],
            'title' => ['required', 'string', 'max:100'],
            'url' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'feature_key' => ['nullable', 'string', 'max:100', 'exists:features,key'],
        ]);

        SubMenu::create([
            'menu_id' => $validated['menu_id'],
            'title' => $validated['title'],
            'url' => $validated['url'] ?? null,
            'position' => $validated['position'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
            'feature_key' => $validated['feature_key'] ?? null,
        ]);

        return redirect()->route('admin.sub-menus.index')
            ->with('success', 'Sub menu created successfully.');
    }

    public function update(Request $request, SubMenu $subMenu)
    {
        $validated = $request->validate([
            'menu_id' => ['required', 'exists:menus,id'],
            'title' => ['required', 'string', 'max:100'],
            'url' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'feature_key' => ['nullable', 'string', 'max:100', 'exists:features,key'],
        ]);

        $subMenu->update($validated);

        return redirect()->route('admin.sub-menus.index')
            ->with('success', 'Sub menu updated successfully.');
    }

    public function destroy(SubMenu $subMenu)
    {
        $subMenu->delete();

        return back()->with('success', 'Sub menu deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|exists:sub_menus,id',
            'order.*.position' => 'required|integer|min:0',
        ]);

        foreach ($request->order as $item) {
            SubMenu::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return back();
    }
}
