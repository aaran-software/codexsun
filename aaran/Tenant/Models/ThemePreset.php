<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;

class ThemePreset extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'variables',
        'is_premium',
    ];

    protected $casts = [
        'variables'   => 'array',
        'is_premium'  => 'boolean',
    ];
}
