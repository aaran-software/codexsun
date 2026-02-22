<?php

namespace Aaran\Tenant\Database\Seeders;

use Aaran\Tenant\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Codexsun',
                'slug' => 'codexsun',
                'domain' => 'project.codexsun.com',
            ],
            [
                'name' => 'Techmedia',
                'slug' => 'techmedia',
                'domain' => 'techmedia.in',
            ],
            [
                'name' => 'The Tirupur Textile',
                'slug' => 'the-tirupur-textile',
                'domain' => 'thetirupurtextiles.com',
            ],
        ];

        foreach ($tenants as $data) {

            $tenant = Tenant::create([
                'uuid' => Str::uuid(),
                'name' => $data['name'],
                'slug' => $data['slug'],
                'is_active' => true,
                'is_suspended' => false,
            ]);

            $tenant->domains()->create([
                'domain' => $data['domain'],
                'is_primary' => true,
                'is_active' => true,
                'force_https' => false,
            ]);
        }
    }
}
