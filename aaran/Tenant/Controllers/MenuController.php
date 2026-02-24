<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Menu;
use Aaran\Tenant\Models\MenuGroup;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = Menu::query()
            ->with(['group:id,name'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('url', 'like', "%{$request->search}%")
                    ->orWhere('feature_key', 'like', "%{$request->search}%");
            })
            ->when($request->status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($request->status === 'deleted', fn ($q) => $q->onlyTrashed())
            ->orderBy('menu_group_id')
            ->orderBy('position');

        return Inertia::render('Admin/Menus/Index', [
            'menus' => $query->paginate(25)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page']),
            'menuGroups' => MenuGroup::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_group_id' => ['required', 'exists:menu_groups,id'],
            'title' => ['required', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:255'],
            'feature_key' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['position'] = $validated['position'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        try {
            Menu::create($validated);
        } catch (\Exception $e) {
            Log::error('Menu creation failed: '.$e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Failed to create menu.']);
        }

        return redirect()->route('admin.menus.index')->with('success', [
            'title' => 'Menu item created successfully!',
            'description' => 'The menu item has been added and is ready to use.',
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'menu_group_id' => ['required', 'exists:menu_groups,id'],
            'title' => ['required', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:255'],
            'feature_key' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['position'] = $validated['position'] ?? $menu->position;
        $validated['is_active'] = $validated['is_active'] ?? $menu->is_active;

        try {
            $menu->update($validated);
        } catch (\Exception $e) {
            Log::error('Menu update failed: '.$e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Failed to update menu.']);
        }

        return redirect()->route('admin.menus.index')->with('success', [
            'title' => 'Menu item updated successfully!',
            'description' => 'The menu item has been updated and saved.',
        ]);
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();

        return back()->with('success', [
            'title' => 'Menu item moved to trash!',
            'description' => 'The menu item has been moved to trash and can be restored if needed.',
        ]);
    }

    public function restore($id)
    {
        $menu = Menu::withTrashed()->findOrFail($id);
        $menu->restore();

        return back()->with('success', [
            'title' => 'Menu item restored!',
            'description' => 'The menu item is now back in the active list.',
        ]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|exists:menus,id',
            'order.*.position' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $item) {
                Menu::where('id', $item['id'])->update(['position' => $item['position']]);
            }
        });

        return redirect()->route('admin.menus.index')->with('success', [
            'title' => 'Menu item updated successfully!',
            'description' => 'The menu item has been updated and saved.',
        ]);
    }
}
