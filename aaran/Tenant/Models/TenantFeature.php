<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;

class TenantFeature extends Model
{
    protected $table = 'tenant_feature';

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
}
