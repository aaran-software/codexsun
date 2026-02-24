<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubMenu extends Model
{
    protected $fillable = [
        'menu_id',
        'title',
        'url',
        'position',
        'is_active',
        'feature_key',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'position' => 'integer',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
