<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    /** @use HasFactory<\Database\Factories\SliderFactory> */
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'title',
        'tagline',
        'action_text',
        'action_link',
        'media_type',
        'media_src',
        'youtube_id',
        'highlights',
        'btn_cta',
        'direction',
        'background_mode',
        'intensity',
        'duration',
        'order',
        'is_active',
    ];

    protected $casts = [
        'highlights' => 'array',
        'is_active' => 'boolean',
    ];
}
