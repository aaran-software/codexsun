<?php

namespace Aaran\Blog\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ ADD THIS LINE

class BlogComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'blog_post_id',
        'user_id',
        'body',
        'approved',
    ];

    protected $casts = [
        'approved' => 'boolean',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class); // ✅ Now resolves correctly
    }
}
