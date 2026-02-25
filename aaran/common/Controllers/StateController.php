<?php

namespace Aaran\Common\Controllers;

use Aaran\Common\Models\State;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = State::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('state_code', 'like', "%{$request->search}%");
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

        return Inertia::render('Common/StateList', [
            'states' => $query
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
        return Inertia::render('Common/StateList', [
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:states,name'],
            'state_code' => ['nullable', 'string', 'max:10', 'unique:states,state_code'],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        State::create([
            'name' => $validated['name'],
            'state_code' => $validated['state_code'] ?? null,
            'active_id' => $validated['active_id'] ?? 1,
        ]);

        return redirect()->route('states.index')->with('success', [
            'title' => 'State created successfully!',
            'description' => 'The state has been added to the system.',
        ]);
    }

    public function edit(State $state): Response
    {
        return Inertia::render('Common/StateList', [
            'state' => $state->only(['id', 'name', 'state_code', 'active_id']),
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, State $state): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:states,name,'.$state->id],
            'state_code' => ['nullable', 'string', 'max:10', 'unique:states,state_code,'.$state->id],
            'active_id' => ['nullable', 'integer', 'in:0,1'],
        ]);

        $state->update([
            'name' => $validated['name'],
            'state_code' => $validated['state_code'] ?? $state->state_code,
            'active_id' => $validated['active_id'] ?? $state->active_id,
        ]);

        return redirect()->route('states.index')->with('success', [
            'title' => 'State updated successfully!',
            'description' => 'All changes have been saved properly.',
        ]);
    }

    public function destroy(State $state): RedirectResponse
    {
        $state->delete();

        return redirect()->route('states.index')->with('success', [
            'title' => 'State deleted successfully!',
            'description' => 'The state has been removed from the system.',
        ]);
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:states,id']);
        State::whereIn('id', $request->ids)->update(['active_id' => 1]);

        return back()->with('success', 'Selected states activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:states,id']);
        State::whereIn('id', $request->ids)->update(['active_id' => 0]);

        return back()->with('success', 'Selected states deactivated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:states,id']);
        State::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected states deleted.');
    }
}
