<?php

// app/Http/Middleware/ResolveTenant.php

namespace App\Http\Middleware;

use App\Services\TenantResolver;
use Closure;
use Inertia\Inertia;

class ResolveTenant
{
    public function handle($request, Closure $next)
    {
        $tenant = app(TenantResolver::class)->resolve();

        if (! $tenant) {
            abort(404, 'Tenant not found');
        }


        if (! $tenant->isAccessible()) {
            abort(403, 'Tenant suspended or inactive');
        }

        // Optional: bind tenant in container
        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}
