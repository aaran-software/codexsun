type AppSurfaceSet = {
  web?: boolean
  internalApi?: boolean
  externalApi?: boolean
  cli?: boolean
}

type AppManifest = {
  id: string
  name: string
  kind: 'host' | 'platform' | 'domain' | 'ops'
  description: string
  entry: 'cxsun'
  surfaces: AppSurfaceSet
}

export type { AppManifest, AppSurfaceSet }
