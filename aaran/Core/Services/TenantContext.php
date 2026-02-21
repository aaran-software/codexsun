<?php

namespace Aaran\Core\Services;

class TenantContext
{
    public function share(): array
    {
        return [
            'tenant' => [
                'id' => 1,
                'name' => 'Aaran',
                'short_name' => 'A',
                'domain' => 'localhost',
                'logo' => '',
                'primary_color' => 'green',
            ],
        ];
    }
}
