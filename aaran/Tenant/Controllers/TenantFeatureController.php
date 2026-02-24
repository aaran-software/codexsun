<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Feature;
use Aaran\Tenant\Models\Tenant;
use Aaran\Tenant\Models\TenantFeature;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantFeatureController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TenantFeature::query()
            ->with(['tenant', 'feature']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('tenant', function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                })
                    ->orWhereHas('feature', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('key', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter (now only active/inactive)
        if ($request->status === 'active') {
            $query->where('is_enabled', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_enabled', false);
        }

        $perPage = $request->input('per_page', 25);

        return Inertia::render('Admin/TenantFeatures/Index', [
            'tenant_features' => $query
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),

            'filters' => $request->only(['search', 'status', 'per_page']),

            'tenants' => Tenant::select('id', 'name', 'slug')->get(),
            'features' => Feature::select('id', 'key', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'feature_id' => ['required', 'exists:features,id'],
            'expires_at' => ['nullable', 'date', 'after:today'],
            'limit' => ['nullable', 'integer', 'min:1'],
            'is_enabled' => ['boolean'],
        ]);

        // Prevent duplicate assignment
        $exists = TenantFeature::where('tenant_id', $validated['tenant_id'])
            ->where('feature_id', $validated['feature_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'feature_id' => 'This feature is already assigned to this tenant.',
            ]);
        }

        TenantFeature::create([
            'tenant_id' => $validated['tenant_id'],
            'feature_id' => $validated['feature_id'],
            'expires_at' => $validated['expires_at'] ?? null,
            'limit' => $validated['limit'] ?? null,
            'is_enabled' => $validated['is_enabled'] ?? true,
        ]);

        return redirect()->route('admin.tenant-features.index')
            ->with('success', 'Feature assigned to tenant successfully.');
    }

    public function update(Request $request, TenantFeature $tenantFeature)
    {
        $validated = $request->validate([
            'expires_at' => ['nullable', 'date', 'after:today'],
            'limit' => ['nullable', 'integer', 'min:1'],
            'is_enabled' => ['boolean'],
        ]);

        $tenantFeature->update([
            'expires_at' => $validated['expires_at'] ?? null,
            'limit' => $validated['limit'] ?? null,
            'is_enabled' => $validated['is_enabled'] ?? $tenantFeature->is_enabled,
        ]);

        return redirect()->route('admin.tenant-features.index')
            ->with('success', 'Tenant feature assignment updated successfully.');
    }

    public function destroy(TenantFeature $tenantFeature)
    {
        $tenantFeature->delete();

        return back()->with('success', 'Tenant feature assignment removed.');
    }
}
