<?php

namespace Aaran\Blog\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class BlogPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'excerpt', 'body', 'featured_image',
        'blog_category_id', 'user_id', 'meta_keywords', 'published', 'active_id',
    ];

    protected $casts = [
        'published' => 'boolean',
        'meta_keywords' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag');
    }

    public function comments()
    {
        return $this->hasMany(BlogComment::class);
    }

    public function images()
    {
        return $this->hasMany(BlogPostImage::class)->orderBy('sort_order');
    }

    public function likes()
    {
        return $this->hasMany(BlogLike::class);
    }

    public function likedByUser(?int $userId): bool
    {
        if (! $userId) {
            return false;
        }

        return $this->likes()
            ->where('user_id', $userId)
            ->where('liked', true)
            ->exists();
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        return $this->featured_image ? Storage::disk('public')->url($this->featured_image) : null;
    }

    public function getImagesWithUrl()
    {
        return $this->images->map(function ($image) {
            $image->url = Storage::disk('public')->url($image->image_path);

            return $image;
        });
    }
}
