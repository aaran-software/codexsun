import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPlatformRuntime, type PlatformRuntime } from './runtime'

let activeRuntime: PlatformRuntime | null = null

afterEach(async () => {
  if (!activeRuntime) {
    return
  }

  await activeRuntime.stop()
  activeRuntime = null
})

describe('createPlatformRuntime', () => {
  it('registers the health module and emits startup events', async () => {
    activeRuntime = createPlatformRuntime('test-runtime', {
      host: '127.0.0.1',
      port: 4290,
      allowedOrigin: 'http://127.0.0.1:4173',
    })
    const healthHandler = vi.fn()

    activeRuntime.eventBus.subscribe('health.checked', healthHandler)

    await activeRuntime.start()

    expect(activeRuntime.modules.map((platformModule) => platformModule.id)).toEqual([
      'health',
    ])
    expect(healthHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'health.checked',
        payload: {
          runtimeId: 'test-runtime',
          status: 'ok',
        },
      }),
    )
  })

  it('mounts internal app routes and plugin external routes through the host', async () => {
    activeRuntime = createPlatformRuntime('api-runtime', {
      host: '127.0.0.1',
      port: 4291,
      allowedOrigin: 'http://127.0.0.1:4173',
    })

    await activeRuntime.start()

    const appsResponse = await fetch(`${activeRuntime.getUrl()}/api/internal/apps`)
    const appsPayload = (await appsResponse.json()) as {
      host: { id: string }
      apps: Array<{ id: string }>
    }

    expect(appsResponse.status).toBe(200)
    expect(appsPayload.host.id).toBe('cxsun')
    expect(appsPayload.apps.map((app) => app.id)).toEqual(['api', 'cli', 'sites'])

    const siteHealthResponse = await fetch(
      `${activeRuntime.getUrl()}/api/external/sites/health`,
    )
    const siteHealthPayload = (await siteHealthResponse.json()) as {
      app: string
      status: string
    }

    expect(siteHealthResponse.status).toBe(200)
    expect(siteHealthPayload).toMatchObject({
      app: 'sites',
      status: 'ok',
    })

    const contactResponse = await fetch(
      `${activeRuntime.getUrl()}/api/external/sites/contact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Studio Client',
          email: 'client@example.com',
          message: 'We need a portfolio launch site with a maintainable backend handoff.',
        }),
      },
    )
    const contactPayload = (await contactResponse.json()) as { status: string }

    expect(contactResponse.status).toBe(202)
    expect(contactPayload.status).toBe('accepted')
  })
})
