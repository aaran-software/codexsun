import { useEffect, useMemo, useState } from "react"

import { getMediaFiles, getMediaFolders, uploadMedia } from "@/api/mediaApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MediaFile, MediaFolder } from "@/types/media"

type MediaPickerProps = {
  value: string
  onChange: (value: string) => void
  module?: string
  preferredFolderId?: number | null
  imagesOnly?: boolean
  label?: string
}

export function MediaPicker({
  value,
  onChange,
  module,
  preferredFolderId,
  imagesOnly = true,
  label = "Media",
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>(preferredFolderId ? String(preferredFolderId) : "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function loadData() {
    const [fileResult, folderResult] = await Promise.all([
      getMediaFiles(search, selectedFolderId ? Number(selectedFolderId) : undefined, false),
      getMediaFolders(),
    ])
    setFiles(fileResult)
    setFolders(folderResult)
  }

  useEffect(() => {
    if (!open) {
      return
    }

    void loadData().catch(() => {
      setFiles([])
      setFolders([])
    })
  }, [open, search, selectedFolderId])

  const filteredFiles = useMemo(() => {
    if (!imagesOnly) {
      return files
    }

    return files.filter((file) => file.mimeType.startsWith("image/"))
  }, [files, imagesOnly])

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setError("")
    try {
      const uploaded = await uploadMedia({
        file,
        folderId: selectedFolderId ? Number(selectedFolderId) : preferredFolderId,
        module,
      })
      onChange(uploaded.fileUrl)
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload media.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Select or paste media URL" />
          <Button type="button" variant="outline" onClick={() => setOpen((current) => !current)}>
            {open ? "Close" : "Browse"}
          </Button>
        </div>
      </div>

      {value && imagesOnly ? (
        <div className="overflow-hidden rounded-md border bg-muted/20 p-2">
          <img src={value} alt="Selected media" className="h-24 w-24 rounded-md object-cover" />
        </div>
      ) : null}

      {open ? (
        <div className="space-y-3 rounded-md border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media" />
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedFolderId} onChange={(event) => setSelectedFolderId(event.target.value)}>
              <option value="">All folders</option>
              {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
            <Input type="file" accept={imagesOnly ? "image/*" : undefined} disabled={uploading} onChange={(event) => void handleUpload(event.target.files)} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                className="overflow-hidden rounded-md border text-left transition hover:border-primary"
                onClick={() => {
                  onChange(file.fileUrl)
                  setOpen(false)
                }}
              >
                {file.mimeType.startsWith("image/") ? (
                  <img src={file.thumbnailUrl || file.fileUrl} alt={file.originalFileName} className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-muted text-sm text-muted-foreground">{file.extension.toUpperCase()}</div>
                )}
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium">{file.originalFileName}</p>
                  <p className="text-xs text-muted-foreground">{file.folderName || "Unfiled"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
