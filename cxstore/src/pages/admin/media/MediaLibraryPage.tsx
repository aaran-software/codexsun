import { useEffect, useMemo, useState } from "react"

import { createMediaFolder, deleteMediaFile, deleteMediaFolder, getMediaFiles, getMediaFolders, restoreMediaFile, uploadMedia } from "@/api/mediaApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MediaFile, MediaFolder } from "@/types/media"

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [search, setSearch] = useState("")
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState("")
  const [folderName, setFolderName] = useState("")
  const [parentFolderId, setParentFolderId] = useState("")
  const [error, setError] = useState("")

  async function loadData() {
    const [fileResult, folderResult] = await Promise.all([
      getMediaFiles(search, selectedFolderId ? Number(selectedFolderId) : undefined, includeDeleted),
      getMediaFolders(),
    ])
    setFiles(fileResult)
    setFolders(folderResult)
  }

  useEffect(() => {
    void loadData().catch(() => {
      setFiles([])
      setFolders([])
    })
  }, [search, selectedFolderId, includeDeleted])

  const folderItems = useMemo(() => folders.map((folder) => ({ value: String(folder.id), label: `${folder.name} (${folder.fileCount})` })), [folders])

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) {
      return
    }

    setError("")
    try {
      await uploadMedia({
        file,
        folderId: selectedFolderId ? Number(selectedFolderId) : null,
      })
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload file.")
    }
  }

  async function handleCreateFolder() {
    setError("")
    try {
      await createMediaFolder({
        name: folderName,
        parentFolderId: parentFolderId ? Number(parentFolderId) : null,
      })
      setFolderName("")
      setParentFolderId("")
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create folder.")
    }
  }

  const columns: CommonListColumn<MediaFile>[] = [
    {
      id: "preview",
      header: "Preview",
      cell: (row) => row.mimeType.startsWith("image/")
        ? <img src={row.thumbnailUrl || row.fileUrl} alt={row.originalFileName} className="h-12 w-12 rounded-md object-cover" />
        : <span className="text-xs">{row.extension.toUpperCase()}</span>,
    },
    { id: "name", header: "File", cell: (row) => row.originalFileName },
    { id: "folder", header: "Folder", cell: (row) => row.folderName || "-" },
    { id: "mime", header: "Type", cell: (row) => row.mimeType },
    { id: "size", header: "Size", cell: (row) => `${Math.max(1, Math.round(row.fileSize / 1024))} KB` },
    { id: "usage", header: "Usage", cell: (row) => row.usage.length },
    { id: "status", header: "Status", cell: (row) => row.isDeleted ? "Deleted" : "Active" },
    {
      id: "actions",
      header: "Action",
      cell: (row) => (
        <div className="flex gap-2">
          {!row.isDeleted ? <Button size="sm" variant="outline" onClick={() => void deleteMediaFile(row.id).then(loadData)}>Delete</Button> : null}
          {row.isDeleted ? <Button size="sm" variant="outline" onClick={() => void restoreMediaFile(row.id).then(loadData)}>Restore</Button> : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Upload File</Label>
          <Input type="file" onChange={(event) => void handleUpload(event.target.files)} />
        </div>
        <div className="space-y-2">
          <Label>Folder Filter</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={selectedFolderId} onChange={(event) => setSelectedFolderId(event.target.value)}>
            <option value="">All folders</option>
            {folderItems.map((folder) => <option key={folder.value} value={folder.value}>{folder.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)} />
            Include deleted
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Folder Name</Label>
          <Input value={folderName} onChange={(event) => setFolderName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Parent Folder</Label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={parentFolderId} onChange={(event) => setParentFolderId(event.target.value)}>
            <option value="">Root</option>
            {folderItems.map((folder) => <option key={folder.value} value={folder.value}>{folder.label}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => void handleCreateFolder()}>Create Folder</Button>
        </div>
        <div className="flex items-end gap-2">
          {selectedFolderId ? <Button variant="outline" onClick={() => void deleteMediaFolder(Number(selectedFolderId)).then(() => { setSelectedFolderId(""); return loadData() })}>Delete Selected Folder</Button> : null}
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-4">{error}</p> : null}
      </section>

      <CommonList
        header={{ pageTitle: "Media Library", pageDescription: "Upload, browse, preview, delete, and restore media assets across the platform." }}
        search={{ value: search, onChange: setSearch, placeholder: "Search media files" }}
        table={{ columns, data: files, emptyMessage: "No media files found." }}
      />
    </div>
  )
}
