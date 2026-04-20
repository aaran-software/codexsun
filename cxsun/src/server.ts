import { createPlatformRuntime } from './platform/runtime'

const runtime = createPlatformRuntime()

await runtime.start()

function shutdown() {
  void runtime.stop().finally(() => {
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
