type PlatformEvents = {
  'platform.started': {
    runtimeId: string
    moduleIds: string[]
  }
  'health.checked': {
    runtimeId: string
    status: 'ok'
  }
}

export type { PlatformEvents }
