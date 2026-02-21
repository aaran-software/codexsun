<?php

namespace Aaran\Web\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Web/Home/Index', [
            'message' => [
                'greetings' => 'Welcome to Aaran!',
                'date' => date('l jS \of F Y h:i:s A'),
            ],
        ]);
    }
}
