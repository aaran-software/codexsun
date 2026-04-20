import type { EventBus } from '@codexsun/core'
import type { PlatformEvents } from '../../platform/events'
import type { PlatformModule } from '../../platform/modules'

type HealthStatus = {
  runtimeId: string
  status: 'ok'
}

function createHealthModule(): PlatformModule {
  return {
    id: 'health',
    register(eventBus: EventBus<PlatformEvents>) {
      eventBus.subscribe('platform.started', async (event) => {
        await eventBus.emit('health.checked', {
          runtimeId: event.payload.runtimeId,
          status: 'ok',
        })
      })
    },
  }
}

function checkHealth(runtimeId: string): HealthStatus {
  return {
    runtimeId,
    status: 'ok',
  }
}

export { checkHealth, createHealthModule }
export type { HealthStatus }
