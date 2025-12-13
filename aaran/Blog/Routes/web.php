<?php

use Illuminate\Support\Facades\Route;


Route::get('/posts', Class\Index::class)->name('posts');

Route::middleware('auth')->group(function () {
    Route::get('/posts/{id}/show', Class\Show::class)->name('posts.show');
    Route::get('postCategory', Class\Category::class)->name('postCategory');
    Route::get('postTags', Class\Tag::class)->name('postTags');
});
