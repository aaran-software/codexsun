<?php

namespace Aaran\Blog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogCategory extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'active_id'];

    public function posts()
    {
        return $this->hasMany(BlogPost::class);
    }

}
