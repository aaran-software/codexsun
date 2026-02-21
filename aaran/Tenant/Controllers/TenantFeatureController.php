<?php

namespace Aaran\Tenant\Controllers;

use App\Models\Feature;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantFeatureController extends Controller
{
    public function index(Tenant $tenant)
    {
        $tenant->load([
            'features' => fn ($q) => $q->withTrashed(),
        ]);

        $allFeatures = Feature::query()
            ->select('id', 'key', 'name', 'description', 'is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Tenants/Features', [
            'tenant' => $tenant->only([
                'id', 'name', 'slug', 'uuid',
            ]),
            'tenantFeatures' => $tenant->features->map(fn ($f) => [
                'id' => $f->id,
                'key' => $f->key,
                'name' => $f->name,
                'pivot' => $f->pivot ? $f->pivot->only([
                    'is_enabled',
                    'expires_at',
                    'limit',
                    'created_at',
                    'updated_at',
                ]) : null,
                'deleted_at' => $f->deleted_at,
            ]),
            'availableFeatures' => $allFeatures->map(fn ($f) => [
                'id' => $f->id,
                'key' => $f->key,
                'name' => $f->name,
                'description' => $f->description,
                'is_active' => $f->is_active,
            ]),
        ]);
    }

    public function store(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'feature_id' => ['required', 'exists:features,id'],
            'is_enabled' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'limit' => ['nullable', 'integer', 'min:0'],
        ]);

        $tenant->features()->syncWithoutDetaching([
            $validated['feature_id'] => [
                'is_enabled' => $validated['is_enabled'] ?? true,
                'expires_at' => $validated['expires_at'] ?? null,
                'limit' => $validated['limit'] ?? null,
            ],
        ]);

        return redirect()->back()->with('success', [
            'title' => 'Feature assigned!',
            'description' => 'The feature has been added to this tenant.',
        ]);
    }

    public function update(Request $request, Tenant $tenant, Feature $feature)
    {
        $validated = $request->validate([
            'is_enabled' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:now'],
            'limit' => ['nullable', 'integer', 'min:0'],
        ]);

        $tenant->features()->updateExistingPivot($feature->id, [
            'is_enabled' => $validated['is_enabled'] ?? true,
            'expires_at' => $validated['expires_at'] ?? null,
            'limit' => $validated['limit'] ?? null,
        ]);

        return redirect()->back()->with('success', [
            'title' => 'Feature updated!',
            'description' => 'Feature settings for this tenant have been saved.',
        ]);
    }

    public function destroy(Tenant $tenant, Feature $feature)
    {
        $tenant->features()->detach($feature->id);

        return redirect()->back()->with('success', [
            'title' => 'Feature removed!',
            'description' => 'The feature is no longer available for this tenant.',
        ]);
    }
}
