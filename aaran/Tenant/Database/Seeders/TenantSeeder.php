<?php

namespace Aaran\Tenant\Database\Seeders;

use Aaran\Tenant\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Codexsun',
                'display_name' => 'Codexsun Technologies',
                'slug' => 'codexsun',
                'tagline' => 'Smart Solutions for Modern Business',
                'domain' => 'project.codexsun.com',
                'settings' => json_encode(['currency' => 'INR', 'timezone' => 'Asia/Kolkata']),
                'plan_id' => 1, // assuming plan IDs exist
            ],
            [
                'name' => 'Techmedia',
                'display_name' => 'Techmedia India',
                'slug' => 'techmedia',
                'tagline' => 'Your Trusted Tech Partner',
                'domain' => 'techmedia.in',
                'settings' => json_encode(['currency' => 'INR', 'theme' => 'dark']),
                'plan_id' => 2,
            ],
            [
                'name' => 'The Tirupur Textile',
                'display_name' => 'The Tirupur Textile Company',
                'slug' => 'the-tirupur-textile',
                'tagline' => 'Quality Fabrics Since 1995',
                'domain' => 'thetirupurtextiles.com',
                'settings' => json_encode(['currency' => 'INR', 'language' => 'en', 'industry' => 'textile']),
                'plan_id' => 3,
            ],
        ];

        foreach ($tenants as $data) {
            $tenant = Tenant::create([
                'uuid' => Str::uuid(),
                'name' => $data['name'],
                'display_name' => $data['display_name'],
                'tagline' => $data['tagline'] ?? null,
                'slug' => $data['slug'],
                'settings' => $data['settings'] ?? null,
                'plan_id' => $data['plan_id'] ?? null,
                'is_active' => true,
                'is_suspended' => false,
            ]);

            $tenant->domains()->create([
                'domain' => $data['domain'],
                'is_primary' => true,
                'is_active' => true,
                'force_https' => true, // most production domains should be https
            ]);
        }
    }
}
