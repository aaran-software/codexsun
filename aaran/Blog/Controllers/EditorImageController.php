<?php

namespace Aaran\Blog\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Aaran\Blog\Models\BlogPostImage;

class EditorImageController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
            'temp_token' => 'required|uuid',
        ]);

        $path = $request->file('image')
            ->store('blog/editor', 'public');

        BlogPostImage::create([
            'blog_post_id' => null,
            'temp_token'   => $request->temp_token,
            'image_path'   => $path,
        ]);

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }
}
