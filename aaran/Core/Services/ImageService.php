<?php

namespace Aaran\Core\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ImageService
{

    public function save(UploadedFile|string|null $image, ?string $oldImage = null, string $directory = 'images', string $name = null): string
    {
        if ($image instanceof UploadedFile) {
            $extension = $image->getClientOriginalExtension();

            if ($name) {
                $filename = pathinfo($name, PATHINFO_EXTENSION)
                    ? $name
                    : Str::slug(pathinfo($name, PATHINFO_FILENAME)) . '.' . $extension;
            } else {
                $filename = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $extension;
            }

            if ($oldImage && Storage::disk('public')->exists("$directory/$oldImage")) {
                Storage::disk('public')->delete("$directory/$oldImage");
            }

            $image->storeAs($directory, $filename, 'public');

            return $filename;
        }

        return $oldImage ?? 'no_image';
    }

}
