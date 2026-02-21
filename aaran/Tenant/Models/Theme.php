<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Theme extends Model
{
    protected $fillable = [
        'tenant_id',
        'preset_id',
        'mode',
        'custom_variables',
        'primary_override',
    ];

    protected $casts = [
        'custom_variables' => 'array',
        'mode'             => 'string',
    ];

    public function preset(): BelongsTo
    {
        return $this->belongsTo(ThemePreset::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
