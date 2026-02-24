<?php

namespace Aaran\Tenant\Services;

use Aaran\Tenant\Models\Menu;
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
            [
                'label' => 'Shop',
                'href' => '/shop',
                'children' => [],
                'is_active' => true,
                'feature_key' => null,
            ],
            [
                'label' => 'About',
                'href' => '/about',
                'children' => [],
                'is_active' => true,
                'feature_key' => null,
            ],
            [
                'label' => 'Custom Build',
                'href' => '/custom-pc',
                'children' => [],
                'is_active' => true,
                'feature_key' => null,
            ],
            [
                'label' => 'Blog',
                'href' => '/blog',
                'children' => [],
                'is_active' => true,
                'feature_key' => 'blog',
            ],
            [
                'label' => 'Contact',
                'href' => '/web-contact',
                'children' => [],
                'is_active' => true,
                'feature_key' => null,
            ],
        ];

        $mainMenus = Menu::query()
            ->where('is_active', true)
            ->with([
                'subMenus' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            ])
            ->orderBy('position')
            ->get();

        $dynamicMenu = $mainMenus->map(function ($menu) {
            $children = $menu->subMenus->map(fn ($sub) => [
                'label' => $sub->title,
                'href' => $sub->url ?? '#',
                'feature_key' => $sub->feature_key,
                'is_active' => $sub->is_active,
            ])->toArray();

            return [
                'label' => $menu->title,
                'href' => $menu->url ?? '#',
                'children' => $children,
                'is_active' => $menu->is_active,
                'feature_key' => $menu->feature_key,
            ];
        })->toArray();

        $finalMenu = ! empty($dynamicMenu) ? $dynamicMenu : $baseMenu;

        $enabledFeatures = $tenant
            ? $tenant->features()
                ->wherePivot('is_enabled', true)
                ->pluck('key')
                ->toArray()
            : [];

        $result = [];

        foreach ($finalMenu as $item) {
            $topVisible = empty($item['feature_key']) || in_array($item['feature_key'], $enabledFeatures);

            if (! $topVisible) {
                continue;
            }

            $filteredChildren = [];

            if (! empty($item['children'])) {
                foreach ($item['children'] as $child) {
                    if (empty($child['feature_key']) || in_array($child['feature_key'], $enabledFeatures)) {
                        $filteredChildren[] = $child;
                    }
                }
            }

            $result[] = [
                ...$item,
                'children' => $filteredChildren,
            ];
        }

        return $result;
    }
}
