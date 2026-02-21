<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Tenant;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    public function switch(Request $request)
    {
        $request->validate([
            'preset_id' => 'required|exists:theme_presets,id',
        ]);

        $tenant = app(Tenant::class);

        if (! $tenant || ! $tenant->theme) {
            abort(404);
        }

        $tenant->theme->update([
            'preset_id' => $request->preset_id,
        ]);

        return back(); // Inertia will reload props
    }
}
