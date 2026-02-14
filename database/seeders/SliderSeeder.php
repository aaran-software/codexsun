<?php

namespace Database\Seeders;

use App\Models\Slider;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        $codexsun = Tenant::where('slug', 'codexsun')->first();
        $techMedia = Tenant::where('slug', 'tech-media')->first();
        $textiles = Tenant::where('slug', 'the-tirupur-textiles')->first();

        /*
        |--------------------------------------------------------------------------
        | CODEXSUN SLIDERS
        |--------------------------------------------------------------------------
        */
        if ($codexsun) {

            Slider::updateOrCreate(
                ['tenant_id' => $codexsun->id, 'order' => 1],
                [
                    'title' => 'Build Scalable SaaS Products',
                    'tagline' => 'We design and develop modern web platforms.',
                    'action_text' => 'Start Your Project',
                    'action_link' => '/contact',
                    'media_type' => 'image',
                    'media_src' => 'sliders/saas.jpg',
                    'highlights' => [
                        ['text' => 'Laravel Experts', 'variant' => 'primary'],
                        ['text' => 'Inertia + React', 'variant' => 'success'],
                    ],
                    'background_mode' => 'parallax',
                    'intensity' => 'medium',
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | TECH MEDIA (Computer Shop)
        |--------------------------------------------------------------------------
        */
        if ($techMedia) {

            Slider::updateOrCreate(
                ['tenant_id' => $techMedia->id, 'order' => 1],
                [
                    'title' => 'High Performance Gaming PCs',
                    'tagline' => 'Custom-built gaming rigs with RTX graphics.',
                    'action_text' => 'Shop Gaming PCs',
                    'action_link' => '/gaming-pcs',
                    'media_type' => 'image',
                    'media_src' => 'sliders/gaming.jpg',
                    'highlights' => [
                        ['text' => 'RTX Graphics', 'variant' => 'primary'],
                        ['text' => 'Liquid Cooling', 'variant' => 'success'],
                    ],
                    'direction' => 'left',
                    'background_mode' => 'parallax',
                    'intensity' => 'medium',
                ]
            );

            Slider::updateOrCreate(
                ['tenant_id' => $techMedia->id, 'order' => 2],
                [
                    'title' => 'Business Workstations',
                    'tagline' => 'Reliable computing for professionals.',
                    'action_text' => 'Explore Workstations',
                    'action_link' => '/workstations',
                    'media_type' => 'image',
                    'media_src' => 'sliders/workstation.jpg',
                    'highlights' => [
                        ['text' => 'Intel i9', 'variant' => 'secondary'],
                        ['text' => 'NVMe SSD', 'variant' => 'success'],
                    ],
                    'background_mode' => 'normal',
                    'intensity' => 'low',
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | THE TIRUPUR TEXTILES
        |--------------------------------------------------------------------------
        */
        if ($textiles) {

            Slider::updateOrCreate(
                ['tenant_id' => $textiles->id, 'order' => 1],
                [
                    'title' => 'Premium Cotton Garments',
                    'tagline' => 'Export quality textile manufacturing.',
                    'action_text' => 'View Collection',
                    'action_link' => '/products',
                    'media_type' => 'image',
                    'media_src' => 'sliders/textile.jpg',
                    'highlights' => [
                        ['text' => '100% Cotton', 'variant' => 'primary'],
                        ['text' => 'Bulk Orders', 'variant' => 'success'],
                    ],
                    'background_mode' => 'cinematic',
                    'intensity' => 'high',
                ]
            );
        }
    }
}
