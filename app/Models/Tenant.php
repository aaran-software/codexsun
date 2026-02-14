<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    /** @use HasFactory<\Database\Factories\TenantFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'industry',
        'is_active',
    ];

    public function sliders()
    {
        return $this->hasMany(Slider::class);
    }
}
