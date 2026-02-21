<?php

// app/Models/Menu.php
namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'menu_group_id',
        'parent_id',
        'title',
        'url',
        'position',
        'is_active',
        'feature_key',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'position'  => 'integer',
    ];

    public function group()
    {
        return $this->belongsTo(MenuGroup::class, 'menu_group_id');
    }

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id')
            ->orderBy('position');
    }

    // Optional: helper to check if it's a top-level item
    public function isTopLevel(): bool
    {
        return is_null($this->parent_id);
    }
}
