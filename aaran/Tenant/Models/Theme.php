<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Theme extends Model
{
    protected $guarded = [];

    protected $casts = [
        'custom_variables' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function preset(): BelongsTo
    {
        return $this->belongsTo(ThemePreset::class, 'preset_id');
    }
}
