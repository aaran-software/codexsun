<?php

namespace Aaran\Tenant\Middleware;

use Aaran\Tenant\Models\Domain;
use Aaran\Tenant\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        // Normalize www
        $host = preg_replace('/^www\./', '', $host);

        // Try to resolve tenant by domain
        $domain = cache()->remember(
            "domain:{$host}",
            3600,
            fn () => Domain::where('domain', $host)
                ->where('is_active', true)
                ->with('tenant')
                ->first()
        );

        $tenant = null;

        // If valid tenant found
        if ($domain && $domain->tenant && $domain->tenant->is_active) {
            $tenant = $domain->tenant;
        }

        // 🔥 Fallback to codexsun.com domain + slug codexsun
        if (! $tenant) {
            $fallbackDomain = cache()->remember(
                'domain:project.codexsun.com',
                3600,
                fn () => Domain::where('domain', 'project.codexsun.com')
                    ->where('is_active', true)
                    ->with('tenant')
                    ->first()
            );

            if ($fallbackDomain &&
                $fallbackDomain->tenant &&
                $fallbackDomain->tenant->slug === 'codexsun' &&
                $fallbackDomain->tenant->is_active) {

                $tenant = $fallbackDomain->tenant;
            }
        }

        if (! $tenant) {
            abort(404, 'No valid tenant found.');
        }

        // Bind tenant into container
        app()->instance(Tenant::class, $tenant);

        return $next($request);
    }
}
