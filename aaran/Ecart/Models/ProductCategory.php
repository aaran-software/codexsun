<?php

namespace Aaran\Ecart\Models;

use Aaran\Blog\Models\BlogPost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'active_id'];

    public function posts()
    {
        return $this->hasMany(BlogPost::class);
    }

}
