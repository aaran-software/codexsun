<?php

namespace Aaran\Core\Tenant;

class Tenant
{
    public static function key(): string
    {
        return config('aaran-app.app_client');
    }

    public static function config(): array
    {
        return config('tenants.'.static::key(), []);
    }

    public static function industry(): ?string
    {
        return static::config()['industry'] ?? null;
    }

    public static function payload(): array
    {
        $key = static::key();
        $config = $key ? config("tenants.$key") : null;

        return [
            'key' => $key,
            'name' => $config['name'] ?? null,
            'industry' => $config['industry'] ?? null,
        ];
    }

}
