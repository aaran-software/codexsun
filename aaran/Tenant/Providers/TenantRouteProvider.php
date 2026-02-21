<?php

namespace Aaran\Tenant\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Route;

class TenantRouteProvider extends RouteServiceProvider
{
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware('web')
                ->group(__DIR__.'/../Routes/web.php');
        });
    }

}
