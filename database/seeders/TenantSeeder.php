<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tenant::updateOrCreate(
            ['slug' => 'tech-media'],
            [
                'name' => 'Tech Media',
                'domain' => '127.0.0.1',
                'industry' => 'computer-shop',
                'is_active' => true,
            ]
        );

        Tenant::updateOrCreate(
            ['slug' => 'the-tirupur-textiles'],
            [
                'name' => 'The Tirupur Textiles',
                'domain' => '127.0.0.1',
                'industry' => 'garment-shop',
                'is_active' => true,
            ]
        );

        Tenant::updateOrCreate(
            ['slug' => 'codexsun'],
            [
                'name' => 'CodexSun',
                'domain' => '127.0.0.1',
                'industry' => 'software',
                'is_active' => true,
            ]
        );
    }
}
