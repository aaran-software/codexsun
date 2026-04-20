import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import type { ServerResponse } from 'node:http'

const contentTypes = new Map<string, string>([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

function resolveStaticAssetPath(publicDir: string, pathname: string) {
  const normalizedPath =
    pathname === '/' ? '/index.html' : decodeURIComponent(pathname)
  const resolvedPath = path.resolve(publicDir, `.${normalizedPath}`)
  const normalizedPublicDir = path.resolve(publicDir)

  if (!resolvedPath.startsWith(normalizedPublicDir)) {
    return null
  }

  return resolvedPath
}

function getContentType(filePath: string) {
  return (
    contentTypes.get(path.extname(filePath).toLowerCase()) ??
    'application/octet-stream'
  )
}

function canServeStaticFile(filePath: string) {
  return existsSync(filePath) && statSync(filePath).isFile()
}

function serveStaticFile(response: ServerResponse, filePath: string) {
  response.writeHead(200, {
    'Content-Type': getContentType(filePath),
  })

  createReadStream(filePath).pipe(response)
}

export { canServeStaticFile, resolveStaticAssetPath, serveStaticFile }
