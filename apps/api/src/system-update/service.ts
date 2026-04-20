import { exec, execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

type UpdateMode = 'manual-host' | 'api-command'

type SystemUpdateStatus = {
  app: string
  version: string
  mode: UpdateMode
  apiUpdateEnabled: boolean
  branch: string
  repositoryUrl: string
  localHead: string
  originHead: string | null
  dirty: boolean
  command: string
  nextMode: string
}

function rootDir() {
  return process.cwd()
}

function readPackageVersion() {
  try {
    const manifest = JSON.parse(
      readFileSync(join(rootDir(), 'package.json'), 'utf8')
    ) as { version?: string }

    return manifest.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

function runGit(args: readonly string[]) {
  try {
    return execFileSync('git', args, {
      cwd: rootDir(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function getUpdateSecret() {
  return (
    process.env.CODEXSUN_UPDATE_SECRET ??
    process.env.SERVER_MONITOR_SHARED_SECRET ??
    ''
  )
}

function verifyUpdateSecret(value: string | string[] | undefined) {
  const expectedSecret = getUpdateSecret()
  const receivedSecret = Array.isArray(value) ? value[0] : value

  return expectedSecret.length > 0 && receivedSecret === expectedSecret
}

function getSystemUpdateStatus(): SystemUpdateStatus {
  const branch =
    process.env.GIT_BRANCH || runGit(['rev-parse', '--abbrev-ref', 'HEAD'])
  const repositoryUrl =
    process.env.GIT_REPOSITORY_URL || runGit(['remote', 'get-url', 'origin'])
  const localHead = runGit(['rev-parse', '--short', 'HEAD']) || 'unknown'
  const originHead =
    branch.length > 0
      ? runGit(['rev-parse', '--short', `origin/${branch}`]) || null
      : null
  const dirty = runGit(['status', '--short']).length > 0
  const apiUpdateEnabled = Boolean(process.env.CODEXSUN_UPDATE_COMMAND)

  return {
    app: 'codexsun',
    version: readPackageVersion(),
    mode: apiUpdateEnabled ? 'api-command' : 'manual-host',
    apiUpdateEnabled,
    branch: branch || 'unknown',
    repositoryUrl: repositoryUrl || 'unknown',
    localHead,
    originHead,
    dirty,
    command: 'npm run deploy:update',
    nextMode: 'GitHub release workflow can SSH to the server and run the same command.',
  }
}

async function runSystemUpdateCommand() {
  const command = process.env.CODEXSUN_UPDATE_COMMAND

  if (!command) {
    return {
      statusCode: 409,
      payload: {
        error: 'API update command is disabled.',
        command: 'npm run deploy:update',
      },
    }
  }

  const result = await execAsync(command, {
    cwd: rootDir(),
    windowsHide: true,
    timeout: Number(process.env.CODEXSUN_UPDATE_TIMEOUT_MS ?? 10 * 60 * 1000),
  })

  return {
    statusCode: 202,
    payload: {
      status: 'accepted',
      stdout: result.stdout.slice(-4000),
      stderr: result.stderr.slice(-4000),
    },
  }
}

export { getSystemUpdateStatus, runSystemUpdateCommand, verifyUpdateSecret }
export type { SystemUpdateStatus }
