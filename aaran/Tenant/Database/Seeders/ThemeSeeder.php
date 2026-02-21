<?php

namespace Aaran\Tenant\Database\Seeders;

use Illuminate\Database\Seeder;
use Aaran\Tenant\Models\Tenant;
use Aaran\Tenant\Models\Theme;
use Aaran\Tenant\Models\ThemePreset;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPreset = ThemePreset::where('slug', 'indigo-default')->first();

        if (! $defaultPreset) {
            $defaultPreset = ThemePreset::first();
        }

        if (! $defaultPreset) {
            $this->command->error('No theme presets found. Run ThemePresetSeeder first.');
            return;
        }

        Tenant::chunk(50, function ($tenants) use ($defaultPreset) {
            foreach ($tenants as $tenant) {

                Theme::updateOrCreate(
                    ['tenant_id' => $tenant->id],
                    [
                        'preset_id' => $defaultPreset->id,
                        'mode' => 'light',
                        'custom_variables' => [],
                        'primary_override' => null,
                    ]
                );

                $this->command->info("Theme assigned to tenant: {$tenant->name}");
            }
        });
    }
}
