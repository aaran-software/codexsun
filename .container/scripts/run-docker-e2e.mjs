import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
const dockerComposeArgs = [
  'compose',
  '-f',
  '.container/clients/codexsun/docker-compose.yml',
]
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173'
const networkName = process.env.NETWORK_NAME ?? 'codexion'

function resolveCommand(command) {
  if (process.platform !== 'win32') {
    return command
  }

  if (command === 'npm') {
    return 'npm.cmd'
  }

  if (command === 'npx') {
    return 'npx.cmd'
  }

  return command
}

async function runCommand(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child =
      process.platform === 'win32'
        ? spawn([resolveCommand(command), ...args].join(' '), {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true,
            ...options,
          })
        : spawn(resolveCommand(command), args, {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: false,
            ...options,
          })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(`${command} ${args.join(' ')} exited with code ${code ?? 1}`)
      )
    })

    child.on('error', reject)
  })
}

async function waitForHttp(url, timeoutMs = 60000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch {}

    await delay(1000)
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function ensureDockerNetwork() {
  try {
    await runCommand('docker', ['network', 'inspect', networkName], {
      stdio: 'ignore',
    })
  } catch {
    await runCommand('docker', ['network', 'create', networkName])
  }
}

async function main() {
  await ensureDockerNetwork()
  await runCommand('docker', [...dockerComposeArgs, 'down', '--remove-orphans'])
  await runCommand('docker', [...dockerComposeArgs, 'up', '--build', '-d'])

  try {
    await waitForHttp(`${baseUrl}/api/health`)
    await waitForHttp(`${baseUrl}/`)

    await runCommand(
      'npx',
      ['playwright', 'test', '-c', 'playwright.docker.config.ts'],
      {
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseUrl,
        },
      }
    )
  } finally {
    await runCommand('docker', [
      ...dockerComposeArgs,
      'down',
      '--remove-orphans',
    ])
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
