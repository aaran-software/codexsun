<?php

namespace Aaran\BMS\Billing\Common\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class CommonRouteProvider extends RouteServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {

            Route::middleware('web')
                ->group(__DIR__ . '/../Routes/web.php');

            Route::middleware('api')
                ->prefix('api')
                ->group(__DIR__ . '/../Routes/api.php');
        });
    }

}
