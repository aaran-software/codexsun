<?php

namespace Aaran\Tenant\Services;

use Aaran\Tenant\Models\Tenant;

class ThemeService
{
    public function resolve(Tenant $tenant): array
    {
        logger('ThemeService running for tenant: '.$tenant->id);

        $tenant->loadMissing(['theme.preset']);

        $presetVariables = $tenant->theme?->preset?->variables ?? [];
        $customVariables = $tenant->theme?->custom_variables ?? [];

        $merged = array_merge($presetVariables, $customVariables);

        return [
            'mode' => $tenant->theme?->mode ?? 'light',
            'variables' => $merged,
        ];
    }
}
