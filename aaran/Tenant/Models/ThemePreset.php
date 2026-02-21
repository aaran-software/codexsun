<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ThemePreset extends Model
{
    protected $guarded = [];

    protected $casts = [
        'variables' => 'array',
    ];

    public function themes(): HasMany
    {
        return $this->hasMany(Theme::class, 'preset_id');
    }
}
