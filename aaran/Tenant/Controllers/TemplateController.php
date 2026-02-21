<?php

namespace Aaran\Tenant\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {

        return Inertia::render('Templates/Index');
    }
}
