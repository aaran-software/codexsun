<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'key',
        'name',
        'slug',
        'industry',

        'domain',
        'custom_domain',
        'force_https',

        'logo',
        'favicon',
        'theme',
        'settings',
        'features',
        'seo',

        'is_active',
        'is_suspended',
    ];

    protected $casts = [
        'theme' => 'array',
        'settings' => 'array',
        'features' => 'array',
        'seo' => 'array',
        'force_https' => 'boolean',
        'is_active' => 'boolean',
        'is_suspended' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasFeature(string $feature): bool
    {
        return data_get($this->features, $feature, false);
    }

    public function isAccessible(): bool
    {
        return $this->is_active && ! $this->is_suspended;
    }
}
