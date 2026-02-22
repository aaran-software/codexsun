<?php

namespace Aaran\Tenant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
}
