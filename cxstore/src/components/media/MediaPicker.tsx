import { useState } from "react"
import { ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MediaFile } from "@/types/media"
import { MediaGalleryModal } from "./MediaGalleryModal"

type MediaPickerProps = {
  value: string
  onChange: (value: string) => void
  onSelect?: (file: MediaFile) => void
  module?: string
  entityId?: string
  entityType?: string
  usageType?: string
  preferredFolderId?: number | null
  imagesOnly?: boolean
  label?: string
}

export function MediaPicker({
  value,
  onChange,
  onSelect,
  module,
  entityId,
  entityType,
  usageType,
  preferredFolderId,
  imagesOnly = true,
  label = "Media",
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input 
            value={value} 
            onChange={(event) => onChange(event.target.value)} 
            placeholder="Select or paste media URL" 
          />
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => setOpen(true)}
            className="shrink-0 font-medium"
          >
            <ImageIcon className="mr-2 size-4" />
            Browse Gallery
          </Button>
        </div>
      </div>

      {value && imagesOnly ? (
        <div className="overflow-hidden rounded-md border bg-muted/20 p-2 shadow-sm transition-all hover:border-primary/50">
          <img 
            src={value} 
            alt="Selected media" 
            className="h-28 w-28 rounded-md object-cover transition-transform hover:scale-105" 
          />
        </div>
      ) : null}

      <MediaGalleryModal
        open={open}
        onOpenChange={setOpen}
        onSelect={(file) => {
          onChange(file.fileUrl)
          if (onSelect) onSelect(file)
        }}
        module={module}
        entityId={entityId}
        entityType={entityType}
        usageType={usageType}
        preferredFolderId={preferredFolderId}
        imagesOnly={imagesOnly}
      />
    </div>
  )
}
