<?php

namespace Aaran\Tenant\Services;

use Aaran\Tenant\Models\Tenant;
use Aaran\Tenant\Models\ThemePreset;

class TenantContext
{
    public function __construct(
        protected ThemeService $themeService
    ) {}

    public function get(): ?Tenant
    {
        if (! app()->bound(Tenant::class)) {
            return null;
        }

        return app(Tenant::class);
    }

    public function share(): array
    {
        $tenant = $this->get();

        if (! $tenant) {
            return [];
        }

        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'theme' => $this->themeService->resolve($tenant),
            ],

            'themePresets' => ThemePreset::select('id', 'name')->get(),
        ];
    }
}
