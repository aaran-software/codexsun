<?php

use Aaran\Blog\Controllers\CategoryController;
use Aaran\Blog\Controllers\CommentController;
use Aaran\Blog\Controllers\PostController;
use Aaran\Blog\Controllers\PostImageController;
use Aaran\Blog\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('blog')->group(function () {

    // Blog Categories
    Route::get('categories', [CategoryController::class, 'index'])
        ->name('blog.categories.index');
    Route::get('categories/create', [CategoryController::class, 'create'])
        ->name('blog.categories.create');
    Route::post('categories', [CategoryController::class, 'store'])
        ->name('blog.categories.store');
    Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])
        ->name('blog.categories.edit');
    Route::put('categories/{category}', [CategoryController::class, 'update'])
        ->name('blog.categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])
        ->name('blog.categories.destroy');

    // Optional: Soft Delete Restore & Force Delete (if you have methods)
    // Route::post('categories/{category}/restore', [CategoryController::class, 'restore'])
    //     ->name('blog.categories.restore');
    // Route::delete('categories/{category}/force', [CategoryController::class, 'forceDelete'])
    //     ->name('blog.categories.forceDelete');

    // Blog Tags
    Route::get('tags', [TagController::class, 'index'])
        ->name('blog.tags.index');
    Route::get('tags/create', [TagController::class, 'create'])
        ->name('blog.tags.create');
    Route::post('tags', [TagController::class, 'store'])
        ->name('blog.tags.store');
    Route::get('tags/{tag}/edit', [TagController::class, 'edit'])
        ->name('blog.tags.edit');
    Route::put('tags/{tag}', [TagController::class, 'update'])
        ->name('blog.tags.update');
    Route::delete('tags/{tag}', [TagController::class, 'destroy'])
        ->name('blog.tags.destroy');

    // Blog Posts
    Route::get('posts', [PostController::class, 'index'])
        ->name('blog.posts.index');
    Route::get('posts/create', [PostController::class, 'create'])
        ->name('blog.posts.create');
    Route::post('posts', [PostController::class, 'store'])
        ->name('blog.posts.store');
    Route::get('posts/{post}/edit', [PostController::class, 'edit'])
        ->name('blog.posts.edit');
    Route::put('posts/{post}', [PostController::class, 'update'])
        ->name('blog.posts.update');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])
        ->name('blog.posts.destroy');

    // Blog Post Gallery Images
    Route::post('posts/{post}/images', [PostImageController::class, 'store'])
        ->name('blog.posts.images.store');
    Route::delete('posts/images/{image}', [PostImageController::class, 'destroy'])
        ->name('blog.posts.images.destroy');
    Route::patch('posts/{post}/images/reorder', [PostImageController::class, 'reorder'])
        ->name('blog.posts.images.reorder');
});



Route::get('blog/web/articles', [PostController::class, 'articles'])
    ->name('blog.web.articles');

Route::get('blog/web/articles/{post}', [PostController::class, 'post'])
    ->name('blog.web.post');

Route::post('blog/comments', [CommentController::class, 'store'])
    ->name('blog.comments.store');

Route::post('blog/posts/like', [\Aaran\Blog\Controllers\BlogLikeController::class, 'toggle'])
    ->name('blog.posts.like')
    ->middleware('auth');

Route::delete(
    '/blog/posts/images/{image}',
    [\Aaran\Blog\Controllers\PostImageController::class, 'destroy']
)->name('blog.posts.images.destroy');
