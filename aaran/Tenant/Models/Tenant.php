<?php

namespace Aaran\Tenant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'is_suspended' => 'boolean',
        'settings' => 'array',
        'plan_id' => 'integer',
    ];

    public function getDisplayNameAttribute($value)
    {
        return $value ?? $this->name;
    }

    public function domains()
    {
        return $this->hasMany(Domain::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function theme()
    {
        return $this->hasOne(Theme::class);
    }

    /**
     * Features enabled for this tenant
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(
            Feature::class,
            'tenant_features',     // pivot table
            'tenant_id',           // foreign key on pivot → Tenant
            'feature_id'           // foreign key on pivot → Feature
        )
            ->withPivot('is_enabled', 'expires_at', 'limit')
            ->withTimestamps();
    }
}
