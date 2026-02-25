<?php

namespace Aaran\Common\Controllers;

use Aaran\Common\Models\District;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DistrictController extends Controller
{
    public function index(Request $request): Response
    {
        $query = District::query();

        // Search
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Status Filter
        if ($request->status) {
            match ($request->status) {
                'active' => $query->where('active_id', 1),
                'inactive' => $query->where(function ($q) {
                    $q->where('active_id', 0)
                        ->orWhereNull('active_id');
                }),
                default => null
            };
        }

        $perPage = $request->per_page ?? 25;

        return Inertia::render('Common/DistrictList', [
            'districts' => $query
                ->orderBy('id', 'desc')
                ->paginate($perPage)
                ->withQueryString(),

            'filters' => $request->only([
                'search',
                'status',
                'per_page',
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Common/DistrictList', [
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:districts,name'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        District::create([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? 1,
        ]);

        return redirect()->route('districts.index')->with('success', [
            'title' => 'District created successfully!',
            'description' => 'The district has been added to the system.',
        ]);
    }

    public function edit(District $district): Response
    {
        return Inertia::render('Common/DistrictList', [
            'district' => $district->only([
                'id', 'name', 'active_id',
            ]),
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, District $district): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:districts,name,'.$district->id],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        $district->update([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? $district->active_id,
        ]);

        return redirect()->route('districts.index')->with('success', [
            'title' => 'District updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(District $district): RedirectResponse
    {
        $district->delete();

        return redirect()->route('districts.index')->with('success', [
            'title' => 'District deleted successfully!',
            'description' => 'The district has been removed from the system.',
        ]);
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:districts,id']); // adjust table name
        District::whereIn('id', $request->ids)->update(['active_id' => 1]);
        return back()->with('success', 'Selected items activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:districts,id']);
        District::whereIn('id', $request->ids)->update(['active_id' => 0]);
        return back()->with('success', 'Selected items deactivated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:districts,id']);
        District::whereIn('id', $request->ids)->delete();
        return back()->with('success', 'Selected items deleted.');
    }
}
