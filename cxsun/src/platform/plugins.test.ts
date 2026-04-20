import { describe, expect, it } from 'vitest'
import { createBackendPluginRegistry } from './plugins'

describe('createBackendPluginRegistry', () => {
  it('registers the current plugin manifests and routes from one place', () => {
    const registry = createBackendPluginRegistry(new Date('2026-04-20T00:00:00.000Z'))

    expect(registry.apps.map((app) => app.id)).toEqual(['api', 'cli', 'sites'])
    expect(registry.appRoutes.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        '/api/internal/sites/summary',
        '/api/external/sites/health',
        '/api/external/sites/site',
        '/api/external/sites/contact',
      ]),
    )
  })
})
