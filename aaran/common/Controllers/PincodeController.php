<?php

namespace Aaran\Common\Controllers;

use Aaran\Common\Models\Pincode;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PincodeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Pincode::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
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

        return Inertia::render('Common/PincodeList', [
            'pincodes' => $query
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
        return Inertia::render('Common/PincodeList', [
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:10', 'unique:pincodes,name', 'regex:/^[0-9]{6}$/'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ], [
            'name.regex' => 'PIN code must be exactly 6 digits.',
        ]);

        Pincode::create([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? 1,
        ]);

        return redirect()->route('pincodes.index')->with('success', [
            'title' => 'PIN code created successfully!',
            'description' => 'The PIN code has been added to the system.',
        ]);
    }

    public function edit(Pincode $pincode): Response
    {
        return Inertia::render('Common/PincodeList', [
            'pincode' => $pincode->only(['id', 'name', 'active_id']),
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, Pincode $pincode): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:10', 'unique:pincodes,name,'.$pincode->id, 'regex:/^[0-9]{6}$/'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ], [
            'name.regex' => 'PIN code must be exactly 6 digits.',
        ]);

        $pincode->update([
            'name' => $validated['name'],
            'active_id' => $validated['active_id'] ?? $pincode->active_id,
        ]);

        return redirect()->route('pincodes.index')->with('success', [
            'title' => 'PIN code updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(Pincode $pincode): RedirectResponse
    {
        $pincode->delete();

        return redirect()->route('pincodes.index')->with('success', [
            'title' => 'PIN code deleted successfully!',
            'description' => 'The PIN code has been removed from the system.',
        ]);
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:pincodes,id']);
        Pincode::whereIn('id', $request->ids)->update(['active_id' => 1]);

        return back()->with('success', 'Selected PIN codes activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:pincodes,id']);
        Pincode::whereIn('id', $request->ids)->update(['active_id' => 0]);

        return back()->with('success', 'Selected PIN codes deactivated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:pincodes,id']);
        Pincode::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected PIN codes deleted.');
    }
}
