<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Tenant;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tenant::query()
            ->with(['owner'])
            ->withTrashed(); // allow soft deleted visibility

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%")
                    ->orWhere('uuid', 'like', "%{$request->search}%");
            });
        }

        // Status Filter
        if ($request->status) {
            match ($request->status) {
                'active' => $query->where('is_active', true)
                    ->where('is_suspended', false)
                    ->whereNull('deleted_at'),

                'inactive' => $query->where('is_active', false)
                    ->whereNull('deleted_at'),

                'suspended' => $query->where('is_suspended', true)
                    ->whereNull('deleted_at'),

                'deleted' => $query->onlyTrashed(),

                default => null
            };
        }

        $perPage = $request->per_page ?? 25;

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $query
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
        return Inertia::render('Admin/Tenants/Create', [
            'users' => User::select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:tenants,slug'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
            'is_suspended' => ['boolean'],
        ]);

        Tenant::create([
            'uuid' => Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'owner_id' => $validated['owner_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_suspended' => $validated['is_suspended'] ?? false,
        ]);

        return redirect()->route('admin.tenants.index')->with('success', [
            'title' => 'Tenant created successfully!',
            'description' => 'The tenant account has been created and is ready to use.',
        ]);
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant->only([
                'id',
                'name',
                'slug',
                'owner_id',
                'is_active',
                'is_suspended',
            ]),
            'users' => User::select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:tenants,slug,' . $tenant->id],
            'owner_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
            'is_suspended' => ['boolean'],
        ]);

        $tenant->update($validated);

        return redirect()->route('admin.tenants.index')->with('success', [
            'title' => 'Tenant updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);

    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->back()->with('success', [
            'title' => 'Tenant deleted successfully!',
            'description' => 'The tenant has been moved to trash.',
        ]);
    }

    // 🔥 Soft Delete Restore
    public function restore($id)
    {
        $tenant = Tenant::withTrashed()->findOrFail($id);

        $tenant->restore();

        return redirect()->back()->with('success', [
            'title' => 'Tenant restored successfully!',
            'description' => 'The tenant has been restored from trash.',
        ]);
    }

    public function current()
    {
        $tenant = app('currentTenant');

        return response()->json($tenant);
    }
}
