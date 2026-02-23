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
            'currentTenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'display_name' => $tenant->display_name,
                'tagline' => $tenant->tagline,
                'slug' => $tenant->slug,
                'theme' => $this->themeService->resolve($tenant),
            ],
            'menu' => $this->getMenuItems($tenant),

            'themePresets' => ThemePreset::select('id', 'name')->get()->toArray(),
        ];
    }

    private function getMenuItems(Tenant $tenant): array
    {

        $baseMenu = [
            ['label' => 'Shop', 'href' => '/shop'],
            ['label' => 'About', 'href' => '/about'],
            ['label' => 'Custom Build', 'href' => '/custom-pc'],
            ['label' => 'Blog', 'href' => '/blog'],
            ['label' => 'Contact', 'href' => '/web-contact'],
        ];

        return $baseMenu;
    }
}
