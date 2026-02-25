<?php

namespace Aaran\Common\Controllers;

use Aaran\Common\Models\City;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function index(Request $request): Response
    {
        $query = City::query();

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

        return Inertia::render('Common/CityList', [
            'cities' => $query
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
        return Inertia::render('Common/CityList', [
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:cities,name'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        City::create([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? 1,
        ]);

        return redirect()->route('cities.index')->with('success', [
            'title' => 'City created successfully!',
            'description' => 'The city has been added to the system.',
        ]);
    }

    public function edit(City $city): Response
    {
        return Inertia::render('Common/CityList', [
            'city' => $city->only([
                'id', 'name', 'active_id',
            ]),
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, City $city): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:cities,name,'.$city->id],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        $city->update([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? $city->active_id,
        ]);

        return redirect()->route('cities.index')->with('success', [
            'title' => 'City updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(City $city): RedirectResponse
    {
        $city->delete();

        return redirect()->route('cities.index')->with('success', [
            'title' => 'City deleted successfully!',
            'description' => 'The city has been removed from the system.',
        ]);
    }

    // In CityController / DistrictController

// CityController.php → update bulk methods to safely read ids (works with both JSON & form data)

    public function bulkActivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', $request->json('ids', []));

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:cities,id',
        ]);

        City::whereIn('id', $ids)->update(['active_id' => 1]);

        return back()->with('success', 'Selected cities activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', $request->json('ids', []));

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:cities,id',
        ]);

        City::whereIn('id', $ids)->update(['active_id' => 0]);

        return back()->with('success', 'Selected cities deactivated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', $request->json('ids', []));

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:cities,id',
        ]);

        City::whereIn('id', $ids)->delete();

        return back()->with('success', 'Selected cities deleted.');
    }
}
