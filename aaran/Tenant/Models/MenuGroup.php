<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;

class MenuGroup extends Model
{
    protected $fillable = [
        'name',
        'location',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
}
