<?php

namespace App\Services;

use App\Models\Tenant;

class TenantResolver
{
    public function resolve(): ?Tenant
    {
        $host = request()->getHost();

//        dd(request()->getHost());


        $tenant = Tenant::where('domain', $host)
            ->where('is_active', true)
            ->first();

        if (! $tenant && app()->environment('local')) {
            return Tenant::where('is_active', true)->first();
        }

        return $tenant;
    }
}
