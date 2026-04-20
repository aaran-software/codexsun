type EventMapBase = Record<string, object | undefined>

type EventEnvelope<TEventName extends string, TPayload> = {
  name: TEventName
  payload: TPayload
  occurredAt: string
}

type EventHandler<
  TEventMap extends EventMapBase,
  TEventName extends keyof TEventMap,
> = (
  event: EventEnvelope<Extract<TEventName, string>, TEventMap[TEventName]>,
) => void | Promise<void>

type EventBus<TEventMap extends EventMapBase> = {
  emit: <TEventName extends keyof TEventMap>(
    eventName: TEventName,
    payload: TEventMap[TEventName],
  ) => Promise<void>
  subscribe: <TEventName extends keyof TEventMap>(
    eventName: TEventName,
    handler: EventHandler<TEventMap, TEventName>,
  ) => () => void
}

function createEventBus<TEventMap extends EventMapBase>(): EventBus<TEventMap> {
  const handlers = new Map<
    keyof TEventMap,
    Set<EventHandler<TEventMap, keyof TEventMap>>
  >()

  async function emit<TEventName extends keyof TEventMap>(
    eventName: TEventName,
    payload: TEventMap[TEventName],
  ) {
    const eventHandlers = handlers.get(eventName)

    if (!eventHandlers?.size) {
      return
    }

    const event: EventEnvelope<
      Extract<TEventName, string>,
      TEventMap[TEventName]
    > = {
      name: eventName as Extract<TEventName, string>,
      payload,
      occurredAt: new Date().toISOString(),
    }

    for (const handler of eventHandlers) {
      await (handler as EventHandler<TEventMap, TEventName>)(event)
    }
  }

  function subscribe<TEventName extends keyof TEventMap>(
    eventName: TEventName,
    handler: EventHandler<TEventMap, TEventName>,
  ) {
    const eventHandlers =
      handlers.get(eventName) ?? new Set<EventHandler<TEventMap, keyof TEventMap>>()

    eventHandlers.add(handler as EventHandler<TEventMap, keyof TEventMap>)
    handlers.set(eventName, eventHandlers)

    return () => {
      const currentHandlers = handlers.get(eventName)

      if (!currentHandlers) {
        return
      }

      currentHandlers.delete(handler as EventHandler<TEventMap, keyof TEventMap>)

      if (currentHandlers.size === 0) {
        handlers.delete(eventName)
      }
    }
  }

  return {
    emit,
    subscribe,
  }
}

export { createEventBus }
export type { EventBus, EventHandler, EventMapBase }
