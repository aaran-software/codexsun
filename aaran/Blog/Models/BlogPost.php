<?php

namespace Aaran\Blog\Models;

use Aaran\Core\User\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class BlogPost extends Model
{

    protected $guarded = [];

    public function scopeActive(Builder $query, $status = '1'): Builder
    {
        return $query->where('active_id', $status);
    }
    public function comments()
    {
        return $this->hasMany(BlogComment::class);
    }
    public function scopeSearchByName(Builder $query, string $search): Builder
    {
        return $query->where('vname', 'like', "%$search%");
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(BlogTag::class);
    }

    public static function type($id)
    {
        return BlogCategory::find($id)->vname ?? 'Unknown';
    }

    public function likes()
    {
        return $this->hasMany(BlogLike::class, 'blog_post_id');
    }

    public static function tagName($str)
    {
        if ($str) {
            return BlogTag::find($str)->vname;
        } else return '';
    }

}
