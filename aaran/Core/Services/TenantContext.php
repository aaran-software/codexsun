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
            'menu' => [
                ['label' => 'Home',     'href' => '/'],
                ['label' => 'Services', 'href' => '/services'],
                ['label' => 'Custom Pc',  'href' => '/custom-pc'],
                ['label' => 'Blog',    'href' => '/blog'],
                ['label' => 'Contact',  'href' => '/contact'],
            ],
        ];
    }
}
