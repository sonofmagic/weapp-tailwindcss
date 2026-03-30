import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { HOT_UPDATE_CASES_BY_TARGET, resolveHotUpdateTargets } from './e2eMatrix'

function toNumberEnv(name: string, fallback: number) {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

async function ensureReportDir(root: string) {
  const dir = path.resolve(root, 'e2e/benchmark/e2e-watch-hmr')
  await mkdir(dir, { recursive: true })
  return dir
}

async function runConcreteCase(root: string, caseName: string) {
  const timeoutMs = toNumberEnv('E2E_WATCH_TIMEOUT_MS', 240000)
  const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 240)
  const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', 15000)
  const reportDir = await ensureReportDir(root)
  const reportFile = path.join(reportDir, `${formatTimestamp()}-${caseName}.json`)

  process.stdout.write(`[e2e-hot-update] start ${caseName}\n`)

  const child = spawn(
    'pnpm',
    [
      '--filter',
      'weapp-tailwindcss',
      'test:watch-hmr',
      '--',
      '--case',
      caseName,
      '--timeout',
      String(timeoutMs),
      '--poll',
      String(pollMs),
      '--max-hot-update-ms',
      String(maxHotUpdateMs),
      '--report',
      reportFile,
      '--skip-build',
      '--quiet-sass',
    ],
    {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  )

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code) => {
      resolve(code ?? 1)
    })
  })

  if (exitCode !== 0) {
    throw new Error(`[e2e-hot-update] case failed: ${caseName} (exit=${exitCode})`)
  }

  process.stdout.write(`[e2e-hot-update] passed ${caseName} -> ${reportFile}\n`)
}

async function main() {
  const root = path.resolve(import.meta.dirname, '..')
  const targets = resolveHotUpdateTargets()
  const onlyCaseName = process.env.E2E_HOT_UPDATE_CASE_NAME

  for (const target of targets) {
    const caseNames = HOT_UPDATE_CASES_BY_TARGET[target.name]
      .filter(caseName => !onlyCaseName || caseName === onlyCaseName)
    if (caseNames.length === 0) {
      continue
    }
    process.stdout.write(`[e2e-hot-update] target ${target.name}: ${caseNames.join(', ')}\n`)
    for (const caseName of caseNames) {
      await runConcreteCase(root, caseName)
    }
  }
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`)
  process.exitCode = 1
})
