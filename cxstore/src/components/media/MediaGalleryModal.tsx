import { useEffect, useMemo, useState } from "react"
import { CheckIcon, ImageIcon, PencilIcon, TrashIcon, UploadCloudIcon } from "lucide-react"

import { deleteMediaFile, getMediaFiles, getMediaFolders, renameMediaFile, uploadMedia } from "@/api/mediaApi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { MediaFile, MediaFolder } from "@/types/media"

type MediaGalleryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (file: MediaFile) => void
  module?: string
  entityId?: string
  entityType?: string
  usageType?: string
  preferredFolderId?: number | null
  imagesOnly?: boolean
}

export function MediaGalleryModal({
  open,
  onOpenChange,
  onSelect,
  module,
  entityId,
  entityType,
  usageType,
  preferredFolderId,
  imagesOnly = true,
}: MediaGalleryModalProps) {
  const [search, setSearch] = useState("")
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>(preferredFolderId ? String(preferredFolderId) : "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  // Rename state
  const [renamingFileId, setRenamingFileId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  async function loadData() {
    try {
      const [fileResult, folderResult] = await Promise.all([
        getMediaFiles(search, selectedFolderId ? Number(selectedFolderId) : undefined, false),
        getMediaFolders(),
      ])
      setFiles(fileResult)
      setFolders(folderResult)
    } catch {
      setFiles([])
      setFolders([])
    }
  }

  useEffect(() => {
    if (open) {
      void loadData()
    } else {
      setSearch("")
      setError("")
      setRenamingFileId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        entityId,
        entityType,
        usageType,
      })
      await loadData()
      if (onSelect) {
        onSelect(uploaded)
        onOpenChange(false)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload media.")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileId: number) {
    if (!window.confirm("Are you sure you want to delete this file?")) return
    try {
      await deleteMediaFile(fileId)
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete file.")
    }
  }

  async function handleRenameSubmit(fileId: number) {
    if (!renameValue.trim()) {
      setRenamingFileId(null)
      return
    }

    setIsRenaming(true)
    try {
      await renameMediaFile(fileId, renameValue.trim())
      await loadData()
      setRenamingFileId(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to rename file.")
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-5xl flex-col p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Media Gallery</DialogTitle>
          <DialogDescription>
            Select, upload, or manage your media files.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b bg-muted/20 px-6 py-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search media..."
              className="max-w-[240px] bg-background"
            />
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedFolderId}
              onChange={(event) => setSelectedFolderId(event.target.value)}
            >
              <option value="">All folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="relative overflow-hidden rounded-md group">
              <Input
                type="file"
                accept={imagesOnly ? "image/*" : undefined}
                disabled={uploading}
                onChange={(event) => void handleUpload(event.target.files)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
              />
              <Button disabled={uploading} className="pointer-events-none w-full relative z-0">
                <UploadCloudIcon className="mr-2 size-4" />
                {uploading ? "Uploading..." : "Upload New"}
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFiles.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="mb-4 size-10 opacity-20" />
              <p>No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary hover:shadow-md"
                >
                  {/* Image/File Preview (Clicking this selects the file) */}
                  <div
                    className="relative aspect-square w-full overflow-hidden bg-muted/30"
                    onClick={() => {
                      if (onSelect) {
                        onSelect(file)
                        onOpenChange(false)
                      }
                    }}
                  >
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={file.thumbnailUrl || file.fileUrl}
                        alt={file.originalFileName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-bold text-muted-foreground">
                        {file.extension.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </div>

                  {/* Details & Actions Footer */}
                  <div className="flex flex-col border-t bg-background p-3">
                    {renamingFileId === file.id ? (
                      // Rename Inline Form
                      <div className="flex items-center gap-1">
                        <Input
                          autoFocus
                          className="h-7 px-2 py-1 text-xs"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleRenameSubmit(file.id)
                            if (e.key === "Escape") setRenamingFileId(null)
                          }}
                          disabled={isRenaming}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 text-green-600 hover:text-green-700"
                          onClick={() => void handleRenameSubmit(file.id)}
                          disabled={isRenaming}
                        >
                          <CheckIcon className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      // Standard Display
                      <>
                        <p className="truncate text-xs font-semibold" title={file.originalFileName}>
                          {file.originalFileName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {Math.max(1, Math.round(file.fileSize / 1024))} KB
                        </p>

                        {/* Hover Actions (Edit/Delete) */}
                        <div className="absolute top-2 right-2 flex translate-x-2 gap-1 rounded-md bg-background/90 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 h-7 w-7 rounded-sm hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenamingFileId(file.id)
                              // Strip extension for initial rename string if preferred, or keep full
                              setRenameValue(file.originalFileName)
                            }}
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 h-7 w-7 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleDelete(file.id)
                            }}
                          >
                            <TrashIcon className="size-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer Area */}
        <div className="border-t bg-muted/10 px-6 py-4 flex justify-between items-center text-sm text-muted-foreground">
          <p>Showing {filteredFiles.length} files</p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close Gallery</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
