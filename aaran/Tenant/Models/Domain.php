<?php

namespace Aaran\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Domain extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'domain',
        'is_primary',
        'is_active',
        'force_https',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'force_https' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Auto Ensure Only One Primary Domain Per Tenant
     *
     * @return void
     */
    protected static function booted()
    {
        static::saving(function ($domain) {

            if ($domain->is_primary) {

                static::where('tenant_id', $domain->tenant_id)
                    ->where('id', '!=', $domain->id)
                    ->update(['is_primary' => false]);
            }
        });
    }
}
