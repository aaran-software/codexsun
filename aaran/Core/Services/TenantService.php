<?php

namespace Aaran\Core\Services;

use Illuminate\Support\Facades\Cache;

class TenantService
{
    /**
     * Current tenant key from config
     */
    public static function key(): string
    {
        return config('aaran-app.app_client');
    }

    /**
     * Base tenant config (config/tenants.php)
     */
    public static function config(): array
    {
        return config('tenants.' . static::key(), []);
    }

    public static function industry(): ?string
    {
        return static::config()['industry'] ?? null;
    }

    public static function domain(): ?string
    {
        return static::config()['domain'] ?? null;
    }

    /**
     * Read JSON file safely
     */
//    protected static function readJson(string $file): array
//    {
//        $key = static::key();
//        $cacheKey = "tenant:{$key}:{$file}";
//
//        return Cache::rememberForever($cacheKey, function () use ($key, $file) {
//            $path = base_path("/aaran/core/tenants/{$key}/{$file}");
//
//            if (!file_exists($path)) {
//                return [];
//            }
//
//            return json_decode(file_get_contents($path), true) ?? [];
//        });
//    }

    protected static function readJson(string $file): array
    {
        $key = static::key();
        $path = base_path("/aaran/core/tenants/{$key}/{$file}");

        if (!file_exists($path)) {
            return [];
        }

        return json_decode(file_get_contents($path), true) ?? [];
    }

    /**
     * Tenant JSON files
     */
    public static function settings(): array
    {
        return static::readJson('settings.json');
    }

    public static function theme(): array
    {
        return static::readJson('theme.json');
    }

    public static function features(): array
    {
        return static::readJson('features.json');
    }

    /**
     * Full frontend payload
     */
    public static function payload(): array
    {
        return [
            'key' => static::key(),
            'name' => static::config()['name'] ?? null,
            'industry' => static::industry(),
//            'domain' => static::domain(),
//            'theme' => static::theme(),
//            'settings' => static::settings(),
//            'features' => static::features(),
        ];
    }
}
