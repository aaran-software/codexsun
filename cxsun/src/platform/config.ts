import path from 'node:path'
import { fileURLToPath } from 'node:url'

type PlatformServerConfig = {
  host: string
  port: number
  allowedOrigin: string
  publicDir: string
}

function getPlatformServerConfig(): PlatformServerConfig {
  const workspaceRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  )

  return {
    host: process.env.CXSUN_SERVER_HOST ?? '127.0.0.1',
    port: Number(process.env.CXSUN_SERVER_PORT ?? '4174'),
    allowedOrigin: process.env.CXSUN_WEB_ORIGIN ?? 'http://127.0.0.1:4173',
    publicDir: process.env.CXSUN_PUBLIC_DIR ?? path.resolve(workspaceRoot, 'dist'),
  }
}

export { getPlatformServerConfig }
export type { PlatformServerConfig }
