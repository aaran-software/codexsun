<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | CODEXSUN (DEFAULT TENANT)
        |--------------------------------------------------------------------------
        */
        Tenant::updateOrCreate(
            ['slug' => 'codexsun'],
            [
                'key' => 'codexsun_default',
                'name' => 'CodexSun',
                'industry' => 'software',

                'domain' => 'codexsun.test',
                'force_https' => false,

                'logo' => '/logos/codexsun.png',
                'favicon' => '/favicons/codexsun.ico',

                'theme' => [
                    'primary_color' => '#6366F1',
                    'secondary_color' => '#0F172A',
                    'layout' => 'modern',
                ],

                'settings' => [
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                    'language' => 'en',
                ],

                'features' => [
                    'blog' => true,
                    'portfolio' => true,
                    'ecommerce' => false,
                    'crm' => true,
                ],

                'seo' => [
                    'meta_title' => 'CodexSun - Software & SaaS Solutions',
                    'meta_description' => 'CodexSun builds scalable SaaS and web solutions.',
                    'meta_keywords' => 'software, saas, web development',
                    'robots' => 'index,follow',
                ],

                'is_active' => true,
                'is_suspended' => false,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | TECH MEDIA
        |--------------------------------------------------------------------------
        */
        Tenant::updateOrCreate(
            ['slug' => 'tech-media'],
            [
                'key' => 'techmedia_001',
                'name' => 'Tech Media',
                'industry' => 'computer-shop',

                'domain' => 'techmedia.test',
                'force_https' => false,

                'theme' => [
                    'primary_color' => '#2563EB',
                    'secondary_color' => '#111827',
                ],

                'settings' => [
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                ],

                'features' => [
                    'blog' => true,
                    'ecommerce' => true,
                    'inventory' => true,
                ],

                'seo' => [
                    'meta_title' => 'Tech Media - Computer Sales & Service',
                    'meta_description' => 'Buy laptops, desktops and accessories.',
                    'robots' => 'index,follow',
                ],

                'is_active' => true,
                'is_suspended' => false,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | THE TIRUPUR TEXTILES
        |--------------------------------------------------------------------------
        */
        Tenant::updateOrCreate(
            ['slug' => 'the-tirupur-textiles'],
            [
                'key' => 'ttt_001',
                'name' => 'The Tirupur Textiles',
                'industry' => 'garment-shop',

                'domain' => 'textiles.test',
                'force_https' => false,

                'theme' => [
                    'primary_color' => '#DC2626',
                    'secondary_color' => '#7C2D12',
                ],

                'settings' => [
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                ],

                'features' => [
                    'catalog' => true,
                    'ecommerce' => true,
                    'wholesale' => true,
                ],

                'seo' => [
                    'meta_title' => 'The Tirupur Textiles - Garment Manufacturer',
                    'meta_description' => 'Leading textile and garment manufacturer in Tirupur.',
                    'robots' => 'index,follow',
                ],

                'is_active' => true,
                'is_suspended' => false,
            ]
        );
    }
}
