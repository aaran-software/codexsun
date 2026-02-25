<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogComment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
