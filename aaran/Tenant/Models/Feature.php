<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_feature')
            ->using(TenantFeature::class)
            ->withPivot([
                'expires_at',
                'limit',
                'is_enabled',
            ])
            ->withTimestamps();
    }

    public function hasFeature(string $key): bool
    {
        $feature = $this->features
            ->where('key', $key)
            ->first();

        if (! $feature) {
            return false;
        }

        $pivot = $feature->pivot;

        if (! $pivot->is_enabled) {
            return false;
        }

        if ($pivot->expires_at && now()->gt($pivot->expires_at)) {
            return false;
        }

        return true;
    }

    public function featureLimit(string $key): ?int
    {
        $feature = $this->features
            ->where('key', $key)
            ->first();

        return $feature?->pivot?->limit;
    }
}
