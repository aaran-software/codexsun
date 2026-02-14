<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;

class TenantResolver
{
    public function resolve(): ?Tenant
    {
        $host = request()->getHost();

        return Cache::remember(
            "tenant:{$host}",
            now()->addMinutes(10),
            function () use ($host) {

                $tenant = Tenant::where(function ($q) use ($host) {
                    $q->where('domain', $host)
                        ->orWhere('custom_domain', $host);
                })
                    ->where('is_active', true)
                    ->first();

                // Local fallback
                if (!$tenant && app()->environment('local')) {
                    return Tenant::where('is_active', true)->first();
                }

                return $tenant;
            }
        );
    }
}
