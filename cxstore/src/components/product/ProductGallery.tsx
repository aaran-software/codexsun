import { useState } from "react"

import type { ProductImage } from "@/types/product"

export function ProductGallery({ images, fallbackUrl }: { images: ProductImage[]; fallbackUrl: string }) {
  const [activeUrl, setActiveUrl] = useState(images.find((image) => image.isPrimary)?.imageUrl ?? images[0]?.imageUrl ?? fallbackUrl)

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card">
        <img src={activeUrl} alt="Product" className="aspect-square w-full object-cover" />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image) => (
            <button key={image.id} type="button" className="overflow-hidden rounded-2xl border border-border/60" onClick={() => setActiveUrl(image.imageUrl)}>
              <img src={image.imageUrl} alt={image.altText || "Product preview"} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
