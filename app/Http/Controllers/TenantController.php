<?php
// app/Http/Controllers/TenantController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function current()
    {
        $tenant = app('currentTenant');

        return response()->json($tenant);
    }
}
