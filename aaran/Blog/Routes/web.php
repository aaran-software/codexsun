<?php

use Aaran\Blog\Controllers\CategoryController;
use Aaran\Blog\Controllers\PostController;
use Aaran\Blog\Controllers\PostImageController;
use Aaran\Blog\Controllers\TagController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->prefix('blog')->group(function () {

    // Blog Categories
    Route::resource('categories', CategoryController::class)->names('blog.categories');

    // Blog Tags
    Route::resource('tags', TagController::class)->names('blog.tags');

    // Blog Posts
    Route::resource('posts', PostController::class)->names('blog.posts');

    // Gallery images for a post
    Route::post('posts/{post}/images', [PostImageController::class, 'store'])->name('blog.posts.images.store');
    Route::delete('posts/images/{image}', [PostImageController::class, 'destroy'])->name('blog.posts.images.destroy');
    Route::patch('posts/{post}/images/reorder', [PostImageController::class, 'reorder'])->name('blog.posts.images.reorder');

});
