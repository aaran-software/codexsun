<?php

namespace Aaran\Tenant\Controllers;

use Aaran\Tenant\Models\Tenant;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index()
    {
        $tenant = app(Tenant::class);

        return Inertia::render('Storefront/Home');
    }
}
