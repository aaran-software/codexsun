<?php

namespace Aaran\Tenant\Controllers;

use App\Models\Tenant;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index()
    {
        return Inertia::render('Storefront/Home');
    }
}
