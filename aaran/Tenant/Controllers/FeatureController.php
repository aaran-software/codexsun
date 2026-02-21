<?php

namespace Aaran\Tenant\Controllers;

use App\Models\Feature;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeatureController extends Controller
{
    public function index(Request $request)
    {
        $query = Feature::query();

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('key', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Active/Inactive filter
        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        $perPage = $request->per_page ?? 25;

        return Inertia::render('Admin/Features/Index', [
            'features' => $query
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),

            'filters' => $request->only([
                'search',
                'status',
                'per_page',
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Features/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:100', 'unique:features,key', 'regex:/^[a-z0-9_-]+$/'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        Feature::create([
            'key' => $validated['key'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.features.index')->with('success', [
            'title' => 'Feature created successfully!',
            'description' => 'New feature has been added to the catalog.',
        ]);
    }

    public function edit(Feature $feature)
    {
        return Inertia::render('Admin/Features/Edit', [
            'feature' => $feature->only([
                'id',
                'key',
                'name',
                'description',
                'is_active',
            ]),
        ]);
    }

    public function update(Request $request, Feature $feature)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:100', 'unique:features,key,'.$feature->id, 'regex:/^[a-z0-9_-]+$/'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        $feature->update($validated);

        return redirect()->route('admin.features.index')->with('success', [
            'title' => 'Feature updated successfully!',
            'description' => 'Feature details have been saved.',
        ]);
    }

    public function destroy(Feature $feature)
    {
        $feature->delete();

        return redirect()->back()->with('success', [
            'title' => 'Feature deleted successfully!',
            'description' => 'Feature has been moved to trash.',
        ]);
    }

    public function restore($id)
    {
        $feature = Feature::withTrashed()->findOrFail($id);
        $feature->restore();

        return redirect()->back()->with('success', [
            'title' => 'Feature restored successfully!',
            'description' => 'Feature is back in the catalog.',
        ]);
    }
}
