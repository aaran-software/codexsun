<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantFeature extends Model
{
    //    use SoftDeletes;

    protected $table = 'tenant_features';

    protected $fillable = [
        'tenant_id',
        'feature_id',
        'expires_at',
        'limit',
        'is_enabled',
    ];

    protected $casts = [
        'expires_at' => 'date',
        'is_enabled' => 'boolean',
    ];

    /**
     * The tenant this feature is assigned to
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\Aaran\Tenant\Models\Tenant::class, 'tenant_id');
    }

    /**
     * The feature being assigned
     */
    public function feature(): BelongsTo
    {
        return $this->belongsTo(\Aaran\Tenant\Models\Feature::class, 'feature_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_enabled', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            });
    }
}
