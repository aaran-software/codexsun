<?php

namespace Aaran\Tenant\Database\Seeders;

use Illuminate\Database\Seeder;
use Aaran\Tenant\Models\ThemePreset;

class ThemePresetSeeder extends Seeder
{
    public function run(): void
    {
        $presets = [

            /*
            |--------------------------------------------------------------------------
            | 1. Default Indigo (Free)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Indigo Default',
                'slug' => 'indigo-default',
                'is_premium' => false,
                'variables' => $this->basePreset(
                    primary: '0.59 0.20 277.06',
                    hue: 260
                ),
            ],

            /*
            |--------------------------------------------------------------------------
            | 2. Emerald Commerce (Premium)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Emerald Commerce',
                'slug' => 'emerald-commerce',
                'is_premium' => true,
                'variables' => $this->basePreset(
                    primary: '0.70 0.22 145',
                    hue: 145
                ),
            ],

            /*
            |--------------------------------------------------------------------------
            | 3. Sunset Orange (Free)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Sunset Orange',
                'slug' => 'sunset-orange',
                'is_premium' => false,
                'variables' => $this->basePreset(
                    primary: '0.72 0.20 35',
                    hue: 30
                ),
            ],

            /*
            |--------------------------------------------------------------------------
            | 4. Rose Luxury (Premium)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Rose Luxury',
                'slug' => 'rose-luxury',
                'is_premium' => true,
                'variables' => $this->basePreset(
                    primary: '0.68 0.18 15',
                    hue: 10
                ),
            ],

            /*
            |--------------------------------------------------------------------------
            | 5. Slate Minimal (Free)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Slate Minimal',
                'slug' => 'slate-minimal',
                'is_premium' => false,
                'variables' => $this->basePreset(
                    primary: '0.45 0.03 260',
                    hue: 260
                ),
            ],
        ];

        foreach ($presets as $preset) {
            ThemePreset::updateOrCreate(
                ['slug' => $preset['slug']],
                $preset
            );
        }
    }

    /**
     * Generate full token set for preset
     */
    private function basePreset(string $primary, int $hue): array
    {
        return [

            // Core
            '--background' => 'oklch(0.98 0 0)',
            '--foreground' => "oklch(0.28 0.04 {$hue})",
            '--card' => 'oklch(1 0 0)',
            '--card-foreground' => "oklch(0.28 0.04 {$hue})",
            '--popover' => 'oklch(1 0 0)',
            '--popover-foreground' => "oklch(0.28 0.04 {$hue})",

            // Primary
            '--primary' => "oklch({$primary})",
            '--primary-foreground' => 'oklch(1 0 0)',

            // Secondary
            '--secondary' => "oklch(0.93 0.01 {$hue})",
            '--secondary-foreground' => "oklch(0.37 0.03 {$hue})",

            // Muted
            '--muted' => 'oklch(0.97 0 0)',
            '--muted-foreground' => "oklch(0.55 0.02 {$hue})",

            // Accent
            '--accent' => "oklch(0.93 0.03 {$hue})",
            '--accent-foreground' => "oklch(0.37 0.03 {$hue})",

            // Destructive
            '--destructive' => 'oklch(0.64 0.21 25)',
            '--border' => "oklch(0.87 0.01 {$hue})",
            '--input' => "oklch(0.87 0.01 {$hue})",
            '--ring' => "oklch({$primary})",

            // Charts
            '--chart-1' => "oklch({$primary})",
            '--chart-2' => "oklch(0.51 0.23 {$hue})",
            '--chart-3' => "oklch(0.46 0.21 {$hue})",
            '--chart-4' => "oklch(0.40 0.18 {$hue})",
            '--chart-5' => "oklch(0.36 0.14 {$hue})",

            // Sidebar
            '--sidebar' => 'oklch(0.97 0 0)',
            '--sidebar-foreground' => "oklch(0.28 0.04 {$hue})",
            '--sidebar-primary' => "oklch({$primary})",
            '--sidebar-primary-foreground' => 'oklch(1 0 0)',
            '--sidebar-accent' => "oklch(0.93 0.03 {$hue})",
            '--sidebar-accent-foreground' => "oklch(0.37 0.03 {$hue})",
            '--sidebar-border' => "oklch(0.87 0.01 {$hue})",
            '--sidebar-ring' => "oklch({$primary})",

            // Typography
            '--font-sans' => 'Inter, sans-serif',
            '--font-serif' => 'Merriweather, serif',
            '--font-mono' => 'JetBrains Mono, monospace',

            // Radius
            '--radius' => '0.5rem',

            // Shadows
            '--shadow-2xs' => '0px 4px 8px -1px oklch(0 0 0 / 0.05)',
            '--shadow-xs' => '0px 4px 8px -1px oklch(0 0 0 / 0.05)',
            '--shadow-sm' => '0px 4px 8px -1px oklch(0 0 0 / 0.10)',
            '--shadow' => '0px 4px 8px -1px oklch(0 0 0 / 0.10)',
            '--shadow-md' => '0px 4px 8px -1px oklch(0 0 0 / 0.10)',
            '--shadow-lg' => '0px 4px 8px -1px oklch(0 0 0 / 0.10)',
            '--shadow-xl' => '0px 4px 8px -1px oklch(0 0 0 / 0.10)',
            '--shadow-2xl' => '0px 4px 8px -1px oklch(0 0 0 / 0.25)',
        ];
    }
}
