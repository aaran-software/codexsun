type PlatformServerConfig = {
  host: string
  port: number
  allowedOrigin: string
}

function getPlatformServerConfig(): PlatformServerConfig {
  return {
    host: process.env.CXSUN_SERVER_HOST ?? '127.0.0.1',
    port: Number(process.env.CXSUN_SERVER_PORT ?? '4174'),
    allowedOrigin: process.env.CXSUN_WEB_ORIGIN ?? 'http://127.0.0.1:4173',
  }
}

export { getPlatformServerConfig }
export type { PlatformServerConfig }
