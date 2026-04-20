import type { IncomingMessage, ServerResponse } from 'node:http'

type PlatformRouteMethod = 'GET' | 'POST' | 'OPTIONS'

type PlatformRouteResponse = {
  statusCode: number
  payload: unknown
}

type PlatformRouteContext = {
  request: IncomingMessage
  response: ServerResponse
  url: URL
  body: unknown
}

type PlatformRouteDefinition = {
  method: PlatformRouteMethod
  path: string
  summary: string
  handler: (
    context: PlatformRouteContext,
  ) => PlatformRouteResponse | Promise<PlatformRouteResponse>
}

export type {
  PlatformRouteContext,
  PlatformRouteDefinition,
  PlatformRouteMethod,
  PlatformRouteResponse,
}
