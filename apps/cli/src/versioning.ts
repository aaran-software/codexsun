import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type ApplicationVersion = {
  referenceNumber: number
  version: string
  label: string
  releaseTag: string
}

type PackageManifest = {
  version?: string
}

type PackageLockManifest = {
  version?: string
  packages?: Record<string, { version?: string }>
}

function createApplicationVersion(referenceNumber: number): ApplicationVersion {
  if (!Number.isInteger(referenceNumber) || referenceNumber <= 0) {
    throw new Error('Reference number must be a positive integer.')
  }

  const version = `1.0.${referenceNumber.toString().padStart(3, '0')}`

  return {
    referenceNumber,
    version,
    label: `v ${version}`,
    releaseTag: `v-${version}`,
  }
}

function parseLatestReference(changelogContent: string) {
  const match = changelogContent.match(
    /### \[v\s+1\.0\.(\d+)\]\s+\d{4}-\d{2}-\d{2}\s+-\s+(.+)/,
  )

  const latestReferenceRaw = match?.[1]
  const latestTitle = match?.[2]?.trim()

  if (!latestReferenceRaw || !latestTitle) {
    throw new Error('Could not determine the latest changelog reference entry.')
  }

  const latestReference = Number.parseInt(latestReferenceRaw, 10)

  if (!Number.isFinite(latestReference) || latestReference <= 0) {
    throw new Error('The changelog reference number is invalid.')
  }

  return {
    number: latestReference,
    title: latestTitle,
  }
}

function formatCommitMessage(referenceNumber: number, message: string) {
  const normalizedMessage = message
    .trim()
    .replace(/^#\d+\s*-\s*/, '')
    .replace(/^#\d+\s+/, '')

  if (!normalizedMessage) {
    throw new Error('Commit message body is required.')
  }

  return `#${referenceNumber} - ${normalizedMessage}`
}

function updatePackageVersionFile(filePath: string, version: string) {
  const manifest = JSON.parse(readFileSync(filePath, 'utf8')) as PackageManifest
  manifest.version = version
  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

function updatePackageLockVersionFile(filePath: string, version: string) {
  const manifest = JSON.parse(
    readFileSync(filePath, 'utf8'),
  ) as PackageLockManifest
  manifest.version = version

  if (manifest.packages?.['']) {
    manifest.packages[''].version = version
  }

  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

function syncVersionFiles(rootDir: string, referenceNumber: number) {
  const version = createApplicationVersion(referenceNumber)

  updatePackageVersionFile(join(rootDir, 'package.json'), version.version)
  updatePackageLockVersionFile(join(rootDir, 'package-lock.json'), version.version)

  return version
}

export {
  createApplicationVersion,
  formatCommitMessage,
  parseLatestReference,
  syncVersionFiles,
}
export type { ApplicationVersion }
