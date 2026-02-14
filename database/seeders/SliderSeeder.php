<?php

namespace Database\Seeders;

use App\Models\Slider;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sales = Tenant::where('slug', 'computer-sales')->first();
        $services = Tenant::where('slug', 'computer-services')->first();

        /* =============================
           COMPUTER SALES SLIDERS
        ============================== */

        Slider::create([
            'tenant_id' => $sales->id,
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
            'order' => 1,
        ]);

        Slider::create([
            'tenant_id' => $sales->id,
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
            'order' => 2,
        ]);

        Slider::create([
            'tenant_id' => $sales->id,
            'title' => 'Custom PC Assembly',
            'tagline' => 'Build your dream PC today.',
            'action_text' => 'Build Now',
            'action_link' => '/custom-build',
            'media_type' => 'image',
            'media_src' => 'sliders/custom.jpg',
            'background_mode' => 'cinematic',
            'intensity' => 'high',
            'order' => 3,
        ]);

        /* =============================
           COMPUTER SERVICES SLIDERS
        ============================== */

        Slider::create([
            'tenant_id' => $services->id,
            'title' => 'IT Support & AMC',
            'tagline' => '24/7 business support services.',
            'action_text' => 'View Plans',
            'action_link' => '/amc',
            'media_type' => 'image',
            'media_src' => 'sliders/support.jpg',
            'highlights' => [
                ['text' => 'Remote Support', 'variant' => 'primary'],
                ['text' => 'On-Site Service', 'variant' => 'success'],
            ],
            'background_mode' => 'normal',
            'order' => 1,
        ]);

        Slider::create([
            'tenant_id' => $services->id,
            'title' => 'Cybersecurity Solutions',
            'tagline' => 'Protect your systems from threats.',
            'action_text' => 'Secure Now',
            'action_link' => '/security',
            'media_type' => 'image',
            'media_src' => 'sliders/security.jpg',
            'highlights' => [
                ['text' => 'Firewall Setup', 'variant' => 'warning'],
                ['text' => 'Threat Monitoring', 'variant' => 'danger'],
            ],
            'background_mode' => '3d',
            'intensity' => 'high',
            'order' => 2,
        ]);
    }
}
