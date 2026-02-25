<?php

namespace Aaran\Common\Controllers;

use Aaran\Common\Models\Country;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CountryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Country::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('country_code', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            match ($request->status) {
                'active' => $query->where('active_id', 1),
                'inactive' => $query->where(function ($q) {
                    $q->where('active_id', 0)->orWhereNull('active_id');
                }),
                default => null
            };
        }

        $perPage = $request->per_page ?? 25;

        return Inertia::render('Common/CountryList', [
            'countries' => $query
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
        return Inertia::render('Common/CountryList', [
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name'],
            'country_code' => ['nullable', 'string', 'max:3', 'unique:countries,country_code'],
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        Country::create([
            'name' => $validated['name'],
            'country_code' => $validated['country_code'] ?? null,
            'currency_symbol' => $validated['currency_symbol'] ?? null,
            'active_id' => $validated['active_id'] ?? 1,
        ]);

        return redirect()->route('countries.index')->with('success', [
            'title' => 'Country created successfully!',
            'description' => 'The country has been added to the system.',
        ]);
    }

    public function edit(Country $country): Response
    {
        return Inertia::render('Common/CountryList', [
            'country' => $country->only([
                'id', 'name', 'country_code', 'currency_symbol', 'active_id',
            ]),
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, Country $country): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name,'.$country->id],
            'country_code' => ['nullable', 'string', 'max:3', 'unique:countries,country_code,'.$country->id],
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        $country->update([
            'name' => $validated['name'],
            'country_code' => $validated['country_code'] ?? $country->country_code,
            'currency_symbol' => $validated['currency_symbol'] ?? $country->currency_symbol,
            'active_id' => $validated['active_id'] ?? $country->active_id,
        ]);

        return redirect()->route('countries.index')->with('success', [
            'title' => 'Country updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(Country $country): RedirectResponse
    {
        $country->delete();

        return redirect()->route('countries.index')->with('success', [
            'title' => 'Country deleted successfully!',
            'description' => 'The country has been removed from the system.',
        ]);
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:countries,id']);
        Country::whereIn('id', $request->ids)->update(['active_id' => 1]);

        return back()->with('success', 'Selected countries activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:countries,id']);
        Country::whereIn('id', $request->ids)->update(['active_id' => 0]);

        return back()->with('success', 'Selected countries deactivated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:countries,id']);
        Country::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected countries deleted.');
    }
}
