<?php

namespace Database\Seeders;

use Aaran\admin\database\seeders\PermissionSeeder;
use Aaran\admin\database\seeders\RoleSeeder;
use Aaran\admin\database\seeders\UserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            UserSeeder::class,
            TenantSeeder::class,
            SliderSeeder::class,
        ]);
    }
}
