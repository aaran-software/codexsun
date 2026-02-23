<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Domain;
use Aaran\Tenant\Models\Tenant;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index(Request $request)
    {
        $query = Domain::query()
            ->with(['tenant'])
            ->withTrashed();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('domain', 'like', "%{$request->search}%");
            });
        }

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
            'domains' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Domains/Upsert', [
            'tenants' => Tenant::select('id', 'name')->orderBy('name')->get(),
            'isEdit' => false,
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

        $isPrimary = $validated['is_primary'] ?? false;

        // If setting as primary → remove primary from any existing domain of this tenant
        if ($isPrimary) {
            Domain::where('tenant_id', $validated['tenant_id'])
                ->where('is_primary', true)
                ->update(['is_primary' => false]);
        }

        Domain::create([
            'tenant_id' => $validated['tenant_id'],
            'domain' => Str::lower($validated['domain']),
            'force_https' => $validated['force_https'] ?? true,
            'is_primary' => $isPrimary,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.domains.index')->with('success', [
            'title' => 'Domain created successfully!',
            'description' => 'The domain has been added and linked to the tenant.',
        ]);
    }

    public function edit(Domain $domain)
    {
        return Inertia::render('Admin/Domains/Upsert', [
            'domain' => $domain->only([
                'id', 'tenant_id', 'domain', 'force_https', 'is_primary', 'is_active',
            ]),
            'tenants' => Tenant::select('id', 'name')->orderBy('name')->get(),
            'isEdit' => true,
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
                'unique:domains,domain,'.$domain->id,
            ],
            'force_https' => ['boolean'],
            'is_primary' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $isPrimary = $validated['is_primary'] ?? false;

        // If we're setting this domain as primary AND it wasn't primary before
        // (or even if it was — we still want to ensure only one primary)
        if ($isPrimary) {
            // Remove primary flag from all other domains of the same tenant
            Domain::where('tenant_id', $validated['tenant_id'])
                ->where('id', '!=', $domain->id)           // exclude current domain
                ->update(['is_primary' => false]);
        }
        // Note: If is_primary = false and this was the previous primary,
        // we allow it (tenant can temporarily have no primary domain)

        $domain->update([
            'tenant_id' => $validated['tenant_id'],
            'domain' => Str::lower($validated['domain']),
            'force_https' => $validated['force_https'] ?? true,
            'is_primary' => $isPrimary,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.domains.index')->with('success', [
            'title' => 'Domain updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(Domain $domain)
    {
        // Optional: if deleting the primary domain, you could add logic here
        // e.g. promote another domain to primary — but for now we keep it simple

        $domain->delete();

        return redirect()->back()->with('success', [
            'title' => 'Domain deleted successfully!',
            'description' => 'The domain has been moved to trash.',
        ]);
    }

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
