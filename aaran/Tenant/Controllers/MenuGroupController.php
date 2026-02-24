<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\MenuGroup;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuGroupController extends Controller
{
    /**
     * Display a listing of menu groups.
     */
    public function index(Request $request)
    {
        $query = MenuGroup::query();

        // Simple search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('location', 'like', "%{$request->search}%");
            });
        }

        // Status filter: active / inactive / trashed
        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        } elseif ($request->status === 'trashed') {
            $query->onlyTrashed();
        }

        $groups = $query
            ->withCount('menus')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/MenuGroups/Index', [
            'menuGroups' => $groups,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new menu group.
     */
    public function create()
    {
        return Inertia::render('Admin/MenuGroups/Create');
    }

    /**
     * Store a newly created menu group.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:menu_groups,name',
            'location' => 'nullable|string|max:50|in:header,footer,sidebar,mobile,other',
            'is_active' => 'boolean',
        ]);

        MenuGroup::create([
            'name' => $validated['name'],
            'location' => $validated['location'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()
            ->route('admin.menu-groups.index')
            ->with('success', 'Menu group created successfully.');
    }

    /**
     * Show the form for editing the specified menu group.
     */
    public function edit(MenuGroup $menuGroup)
    {
        return Inertia::render('Admin/MenuGroups/Edit', [
            'menuGroup' => $menuGroup->only([
                'id',
                'name',
                'location',
                'is_active',
            ]),
        ]);
    }

    /**
     * Update the specified menu group.
     */
    public function update(Request $request, MenuGroup $menuGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:menu_groups,name,'.$menuGroup->id,
            'location' => 'nullable|string|max:50|in:header,footer,sidebar,mobile,other',
            'is_active' => 'boolean',
        ]);

        $menuGroup->update($validated);

        return redirect()
            ->route('admin.menu-groups.index')
            ->with('success', 'Menu group updated successfully.');
    }

    /**
     * Soft delete the specified menu group.
     */
    public function destroy(MenuGroup $menuGroup)
    {
        // Optional: prevent deletion if it has menus
        if ($menuGroup->menus()->exists()) {
            return back()->with('error', 'Cannot delete menu group that contains menu items. Please delete or move menus first.');
        }

        $menuGroup->delete();

        return back()->with('success', 'Menu group moved to trash.');
    }

    /**
     * Restore a soft-deleted menu group.
     */
    public function restore($id)
    {
        $group = MenuGroup::withTrashed()->findOrFail($id);
        $group->restore();

        return back()->with('success', 'Menu group restored successfully.');
    }

    /**
     * Toggle active/inactive status (quick action)
     */
    public function toggleActive(MenuGroup $menuGroup)
    {
        $menuGroup->update(['is_active' => ! $menuGroup->is_active]);

        $status = $menuGroup->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Menu group {$status}.");
    }
}
