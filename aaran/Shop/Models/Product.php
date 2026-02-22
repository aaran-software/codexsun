<?php

namespace Aaran\Shop\Models;

use Aaran\Tenant\Models\Tenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'tenant_id', 'category_id', 'name', 'slug', 'description',
        'price', 'original_price', 'image', 'gallery', 'stock_quantity',
        'in_stock', 'rating', 'review_count', 'badge', 'is_featured',
        'display_order',
    ];

    protected $casts = [
        'gallery' => 'array',
        'in_stock' => 'boolean',
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive($query)
    {
        return $query->where('in_stock', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
