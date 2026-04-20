import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

type PlatformServerConfig = {
  host: string
  port: number
  allowedOrigin: string
  publicDir: string
}

function loadRootEnvFile(workspaceRoot: string) {
  const envPath = path.resolve(workspaceRoot, '.env')

  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    let value = trimmedLine.slice(separatorIndex + 1).trim()

    if (!key || process.env[key] !== undefined) {
      continue
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

function getPlatformServerConfig(): PlatformServerConfig {
  const workspaceRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..'
  )

  loadRootEnvFile(workspaceRoot)

  return {
    host: process.env.CXSUN_SERVER_HOST ?? process.env.APP_HOST ?? '127.0.0.1',
    port: Number(
      process.env.CXSUN_SERVER_PORT ?? process.env.APP_HTTP_PORT ?? '4174'
    ),
    allowedOrigin:
      process.env.CXSUN_WEB_ORIGIN ??
      `http://${process.env.FRONTEND_DOMAIN ?? '127.0.0.1'}:${process.env.FRONTEND_HTTP_PORT ?? '4173'}`,
    publicDir:
      process.env.CXSUN_PUBLIC_DIR ?? path.resolve(workspaceRoot, 'dist'),
  }
}

export { getPlatformServerConfig }
export type { PlatformServerConfig }
