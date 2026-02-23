<?php

namespace Aaran\Web\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class WebContactController extends Controller
{
    public function index(): Response
    {
        $home = new HomeController;

        return Inertia::render('Web/web-contacts/index', [
            'company' => $home->getCompanyData(),
            'location' => $home->location(),
            'callToAction' => $home->callToAction(),
            'footer' => $home->footer(),
            'hero' => $home->getHeroData(),
        ]);
    }
}
