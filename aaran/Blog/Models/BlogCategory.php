<?php

namespace Aaran\Blog\Models;

use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{

    protected $fillable = ['name', 'slug', 'active_id'];

    public function posts()
    {
        return $this->hasMany(BlogPost::class);
    }

}
