<?php

namespace Aaran\Core\Services;

class TenantContext
{
    public function share(): array
    {
        return [
            'tenant' => [
                'id' => 1,
                'name' => 'techmedia',
                'short_name' => 'TM',
                'displayName' => 'Techmedia',
                'domain' => 'localhost',
                'logo' => '',
                'primary_color' => 'green',
            ],
            'menu' => [                     // ← added as separate top-level prop
                ['label' => 'Home',     'href' => '/'],
                ['label' => 'Features', 'href' => '/features'],
                ['label' => 'Pricing',  'href' => '/pricing'],
                ['label' => 'About',    'href' => '/about'],
                ['label' => 'Contact',  'href' => '/contact'],
            ],
        ];
    }
}
