import { createPlatformRuntime } from './runtime'

async function bootstrapPlatform() {
  const runtime = createPlatformRuntime()

  await runtime.start()

  return runtime
}

export { bootstrapPlatform }
