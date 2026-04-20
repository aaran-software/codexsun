import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { argv, cwd, exit, stdout } from 'node:process'

function findRootDir() {
  return resolve(cwd())
}

function runUpdateScript(args: readonly string[]) {
  const rootDir = findRootDir()
  const scriptPath = join(rootDir, '.container', 'bash', 'update.sh')

  if (!existsSync(scriptPath)) {
    throw new Error(`Update script not found: ${scriptPath}`)
  }

  const child = spawn('bash', ['.container/bash/update.sh', ...args], {
    cwd: rootDir,
    env: process.env,
    shell: false,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    exit(code ?? 1)
  })
}

function showHelp() {
  stdout.write(`Codexsun deployment update helper

Usage:
  npm run deploy:status
  npm run deploy:update
  tsx apps/cli/src/deploy-update-helper.ts status
  tsx apps/cli/src/deploy-update-helper.ts update --force

The update command runs the host-side .container/bash/update.sh script.
It preserves ignored .env files, Docker volumes, external networks, and database containers.
`)
}

const [, , command = 'status', ...args] = argv

try {
  switch (command) {
    case 'status':
      runUpdateScript(['status', ...args])
      break
    case 'update':
      runUpdateScript(['update', ...args])
      break
    case '--help':
    case '-h':
    case 'help':
      showHelp()
      break
    default:
      throw new Error(`Unknown deploy update command: ${command}`)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  stdout.write(`${message}\n`)
  exit(1)
}
