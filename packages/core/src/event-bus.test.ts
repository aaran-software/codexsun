import { describe, expect, it, vi } from 'vitest'
import { createEventBus } from './event-bus'

type TestEvents = {
  'platform.started': {
    runtimeId: string
  }
  'health.checked': {
    status: 'ok'
  }
}

describe('createEventBus', () => {
  it('delivers typed events to subscribed handlers', async () => {
    const eventBus = createEventBus<TestEvents>()
    const handler = vi.fn()

    eventBus.subscribe('platform.started', handler)

    await eventBus.emit('platform.started', { runtimeId: 'cxsun-runtime' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'platform.started',
        payload: { runtimeId: 'cxsun-runtime' },
      }),
    )
  })

  it('stops calling handlers after unsubscribe', async () => {
    const eventBus = createEventBus<TestEvents>()
    const handler = vi.fn()
    const unsubscribe = eventBus.subscribe('health.checked', handler)

    unsubscribe()
    await eventBus.emit('health.checked', { status: 'ok' })

    expect(handler).not.toHaveBeenCalled()
  })
})
