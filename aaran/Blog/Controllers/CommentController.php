<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogCategory;
use Aaran\Blog\Models\BlogComment;
use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogTag;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class CommentController extends Controller
{
    public function store(Request $request)
{
    $data = $request->validate([
        'blog_post_id' => 'required|exists:blog_posts,id',
        'body' => 'required|string|min:3',
    ]);

    BlogComment::create([
        'blog_post_id' => $data['blog_post_id'],
        'user_id' => Auth::id(),
        'body' => $data['body'],
        'approved' => true,
    ]);

    return back()->with('success', 'Comment added');
}
}
