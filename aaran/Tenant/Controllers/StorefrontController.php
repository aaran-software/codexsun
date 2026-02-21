<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Tenant;
use Aaran\Tenant\Models\Theme;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index()
    {
        $tenant = app(Tenant::class);

        return Inertia::render('Storefront/Home');
    }

    public function switch(Request $request)
    {
        $request->validate(['preset_id' => 'required|exists:theme_presets,id']);

        $tenant = app(Tenant::class);

        $theme = $tenant->theme ?? new Theme(['tenant_id' => $tenant->id]);

        $theme->preset_id = $request->preset_id;
        $theme->custom_variables = []; // or keep if you want to merge
        $theme->mode = $theme->mode ?? 'light';

        $theme->save();

        // Clear any tenant-specific cache if you use any
        // Cache::forget("tenant_theme_{$tenant->id}");

        $tenant->load('theme.preset'); // force fresh relation

        return back()->with('status', 'Theme switched');
    }
}
