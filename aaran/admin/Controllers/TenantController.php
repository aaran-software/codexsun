<?php

namespace Aaran\admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%")
                    ->orWhere('domain', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            }

            if ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
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
        return Inertia::render('Admin/Tenants/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:tenants',
            'domain' => 'nullable|unique:tenants',
        ]);

        Tenant::create([
            'key' => Str::uuid(),
            ...$request->only([
                'name',
                'slug',
                'domain',
                'industry',
                'theme',
                'features',
                'settings',
            ]),
        ]);

        return redirect()->route('admin.tenants.index');
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:tenants,slug,'.$tenant->id],
            'domain' => ['nullable', 'string'],
            'industry' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $tenant->update($validated);

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return back();
    }

    public function current()
    {
        $tenant = app('currentTenant');

        return response()->json($tenant);
    }
}
