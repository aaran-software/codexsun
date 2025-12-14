<?php

namespace Aaran\Blog\Models;

use Illuminate\Database\Eloquent\Model;

class BlogTag extends Model
{
    protected $fillable = ['name', 'slug', 'active_id'];

    public function posts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tag');
    }

}
