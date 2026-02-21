<?php

namespace Database\Seeders;

use Aaran\Tenant\Database\Seeders\TenantSeeder;
use Aaran\Tenant\Database\Seeders\ThemePresetSeeder;
use Aaran\Tenant\Database\Seeders\ThemeSeeder;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'sundar',
            'email' => 'sundar@sundar.com',
            'password' => Hash::make('kalarani'),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);


        $this->call([
            TenantSeeder::class,
            ThemePresetSeeder::class,
            ThemeSeeder::class,
        ]);
    }
}
