<?php

namespace Aaran\Tenant\Controllers;

use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index(Request $request)
    {
        $query = Domain::query()
            ->with(['tenant'])
            ->withTrashed(); // allow soft deleted visibility

        /* ---------------------------------------------------------
           Search
        ---------------------------------------------------------- */

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('domain', 'like', "%{$request->search}%");
            });
        }

        /* ---------------------------------------------------------
           Status Filter
        ---------------------------------------------------------- */

        if ($request->status) {
            match ($request->status) {
                'active' => $query->where('is_active', true)
                    ->whereNull('deleted_at'),

                'deleted' => $query->onlyTrashed(),

                default => null
            };
        }

        $perPage = $request->per_page ?? 25;

        return Inertia::render('Admin/Domains/Index', [
            'domains' => $query
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
        return Inertia::render('Admin/Domains/Create', [
            'tenants' => Tenant::select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain'],
            'force_https' => ['boolean'],
            'is_primary' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        Domain::create([
            'tenant_id' => $validated['tenant_id'],
            'domain' => Str::lower($validated['domain']),
            'force_https' => $validated['force_https'] ?? true,
            'is_primary' => $validated['is_primary'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.domains.index')->with('success', [
            'title' => 'Domain created successfully!',
            'description' => 'The domain has been added and linked to the tenant.',
        ]);
    }

    public function edit(Domain $domain)
    {
        return Inertia::render('Admin/Domains/Edit', [
            'domain' => $domain->only([
                'id',
                'tenant_id',
                'domain',
                'force_https',
                'is_primary',
                'is_active',
            ]),
            'tenants' => Tenant::select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Domain $domain)
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'domain' => [
                'required',
                'string',
                'max:255',
                'unique:domains,domain,' . $domain->id,
            ],
            'force_https' => ['boolean'],
            'is_primary' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $domain->update([
            'tenant_id' => $validated['tenant_id'],
            'domain' => Str::lower($validated['domain']),
            'force_https' => $validated['force_https'] ?? true,
            'is_primary' => $validated['is_primary'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.domains.index')->with('success', [
            'title' => 'Domain updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(Domain $domain)
    {
        $domain->delete();

        return redirect()->back()->with('success', [
            'title' => 'Domain deleted successfully!',
            'description' => 'The domain has been moved to trash.',
        ]);
    }

    // 🔥 Soft Delete Restore
    public function restore($id)
    {
        $domain = Domain::withTrashed()->findOrFail($id);

        $domain->restore();

        return redirect()->back()->with('success', [
            'title' => 'Domain restored successfully!',
            'description' => 'The domain has been restored from trash.',
        ]);
    }
}
