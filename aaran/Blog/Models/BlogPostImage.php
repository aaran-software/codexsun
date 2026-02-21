<?php

namespace Aaran\Blog\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPostImage extends Model
{
    protected $table = 'blog_post_images';

    protected $fillable = [
        'blog_post_id',
        'image_path',
        'alt_text',
        'caption',
        'sort_order',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }
}
