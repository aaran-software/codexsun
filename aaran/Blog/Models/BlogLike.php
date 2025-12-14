<?php

namespace Aaran\Blog\Models;

use Illuminate\Database\Eloquent\Model;

class BlogLike extends Model
{

    public $incrementing = false; // Since composite primary key

    protected $fillable = ['blog_post_id', 'user_id', 'liked'];

    protected $casts = [
        'liked' => 'boolean',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
