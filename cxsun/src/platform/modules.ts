import type { EventBus } from '@codexsun/core'
import type { PlatformEvents } from './events'

type PlatformModule = {
  id: string
  register: (eventBus: EventBus<PlatformEvents>) => void
}

export type { PlatformModule }
