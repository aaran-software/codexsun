<?php

namespace Aaran\Blog\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogLike extends Model
{
    use SoftDeletes;

    protected $table = 'blog_likes';

    public $incrementing = false;   // composite key
    protected $primaryKey = null;   // 👈 VERY IMPORTANT
    protected $keyType = 'int';

    protected $fillable = [
        'blog_post_id',
        'user_id',
        'liked',
    ];

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
