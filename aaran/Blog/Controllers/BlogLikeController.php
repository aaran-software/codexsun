<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlogLikeController
{
    public function toggle(Request $request)
    {
        $request->validate([
            'blog_post_id' => 'required|exists:blog_posts,id',
        ]);

        $userId = Auth::id();
        $postId = $request->blog_post_id;

        // 👉 YOUR CODE GOES HERE
        $like = BlogLike::withTrashed()
            ->where('blog_post_id', $postId)
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            if ($like->trashed()) {
                // Like again
                $like->restore();
                $like->update(['liked' => true]);
            } else {
                // Unlike
                $like->delete();
            }
        } else {
            // First time like
            BlogLike::create([
                'blog_post_id' => $postId,
                'user_id' => $userId,
                'liked' => true,
            ]);
        }

        return back();
    }
}
