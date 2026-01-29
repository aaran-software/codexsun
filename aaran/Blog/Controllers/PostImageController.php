<?php

namespace Aaran\Blog\Controllers;

use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogPostImage;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostImageController extends Controller
{
    public function store(Request $request, BlogPost $post)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB per image
            'images' => 'array|max:10',
        ]);

        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('blog/gallery', 'public');

            BlogPostImage::create([
                'blog_post_id' => $post->id,
                'image_path' => $path,
                'alt_text' => $request->input('alt_texts.' . $index),
                'caption' => $request->input('captions.' . $index),
                'sort_order' => $index,
            ]);
        }

        return back()->with('success', 'Gallery images uploaded successfully.');
    }

    public function destroy(BlogPostImage $image): RedirectResponse
    {
        // Delete file
        Storage::disk('public')->delete($image->image_path);

        // If featured image → clear it
        if ($image->post->featured_image === $image->image_path) {
            $image->post->update(['featured_image' => null]);
        }

        // Delete record
        $image->delete();

        return back()->with('success', 'Image removed');
    }

    public function reorder(Request $request, BlogPost $post)
    {
        $request->validate([
            'orderedIds' => 'required|array',
            'orderedIds.*' => 'exists:blog_post_images,id',
        ]);

        foreach ($request->orderedIds as $index => $id) {
            BlogPostImage::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Order updated']);
    }
}
