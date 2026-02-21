<?php

namespace Aaran\Tenant\Controllers;

use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {

        return Inertia::render('templates/Index');
    }
}
