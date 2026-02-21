<?php

namespace Aaran\Tenant\Services;

use Aaran\Tenant\Models\Tenant;

class ThemeService
{
    public function resolve(Tenant $tenant): array
    {
        $tenant->loadMissing(['theme.preset']);

        $preset = $tenant->theme?->preset;

        $presetVariables  = $preset?->variables ?? [];
        $customVariables  = $tenant->theme?->custom_variables ?? [];

        $merged = array_merge($presetVariables, $customVariables);

        return [
            'mode'        => $tenant->theme?->mode ?? 'light',
            'preset_id'   => $preset?->id,
            'preset_name' => $preset?->name,
            'variables'   => $merged,
        ];
    }
}
