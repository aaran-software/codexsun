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

        // Share globally with Inertia
        Inertia::share('tenant', [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'industry' => $tenant->industry,
            'domain' => $tenant->domain,
        ]);

        // Optional: bind tenant in container
        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}
