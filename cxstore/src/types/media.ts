export interface MediaUsage {
  id: number
  module: string
  entityId: string
  entityType: string
  usageType: string
  createdAt: string
}

export interface MediaFolder {
  id: number
  name: string
  parentFolderId?: number | null
  path: string
  fileCount: number
  childFolderCount: number
  createdAt: string
  updatedAt: string
}

export interface MediaFile {
  id: number
  fileName: string
  originalFileName: string
  filePath: string
  fileUrl: string
  fileSize: number
  mimeType: string
  extension: string
  storageProvider: string
  folderId?: number | null
  folderName: string
  uploadedByUserId: string
  uploadedByUsername: string
  checksum: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  thumbnailUrl: string
  mediumUrl: string
  largeUrl: string
  usage: MediaUsage[]
}

export interface MediaFolderCreateRequest {
  name: string
  parentFolderId?: number | null
}

export interface MediaUploadRequest {
  file: File
  folderId?: number | null
  module?: string
  entityId?: string
  entityType?: string
  usageType?: string
}
