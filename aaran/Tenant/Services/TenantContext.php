<?php

namespace Aaran\Tenant\Services;

use Aaran\Tenant\Models\Tenant;
use Aaran\Tenant\Models\ThemePreset;

class TenantContext
{
    public function __construct(
        protected ThemeService $themeService
    )
    {
    }

    public function get(): ?Tenant
    {
        if (!app()->bound(Tenant::class)) {
            return null;
        }

        return app(Tenant::class);
    }

    public function share(): array
    {
        $tenant = $this->get();

        if (!$tenant) {
            return [];
        }

        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'theme' => $this->themeService->resolve($tenant),
            ],
            'menu' => $this->getMenuItems($tenant),

            'themePresets' => ThemePreset::select('id', 'name')->get()->toArray(),
        ];
    }

    private function getMenuItems(Tenant $tenant): array
    {
        // You can make this dynamic later (from DB, tenant settings, etc.)
        // For now: basic public menu + conditional auth items handled in frontend

        $baseMenu = [
            ['label' => 'Home', 'href' => '/'],
            ['label' => 'About', 'href' => '/about'],
            ['label' => 'Services', 'href' => '/service'],
            ['label' => 'Contact', 'href' => '/web-contact'],
        ];

        // Optional: tenant can override or add custom menu items
        // Example: if ($tenant->has_custom_menu) { ... merge ... }

        return $baseMenu;
    }
}
