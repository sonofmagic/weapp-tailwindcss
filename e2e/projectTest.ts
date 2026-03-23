import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { describe, it } from 'vitest'
import { collectCssSnapshots, formatWxml, logE2EError, projectFilter, removeWxmlId, resolveSnapshotFile, twExtract, wait } from './shared'

const EPERM_RE = /EPERM/i

interface ProjectTestOptions {
  suite: string
  fixturesDir: string
  describeTitle?: string
  allowExtractionFailure?: boolean
}

interface StableWxmlOptions {
  timeoutMs?: number
  intervalMs?: number
  stableRounds?: number
  settleMs?: number
}

async function safeRm(target: string) {
  try {
    await fs.rm(target, { recursive: true, force: true })
  }
  catch (error: any) {
    const code = error?.code
    if (!(code && ['ENOENT', 'EPERM', 'EBUSY', 'ENOTEMPTY'].includes(code))) {
      throw error
    }
  }
}

async function clearTailwindPatchCaches(root: string) {
  const workspaceRoot = path.resolve(root, '..', '..')
  const candidates = new Set<string>([
    path.resolve(root, 'node_modules/.cache/tailwindcss-patch'),
    path.resolve(root, 'src/node_modules/.cache/tailwindcss-patch'),
    path.resolve(root, 'config/node_modules/.cache/tailwindcss-patch'),
    path.resolve(root, 'node_modules/.vite'),
    path.resolve(workspaceRoot, 'node_modules/.cache/tailwindcss-patch'),
    path.resolve(workspaceRoot, 'packages/weapp-tailwindcss/node_modules/.cache/tailwindcss-patch'),
  ])

  await Promise.all(
    Array.from(candidates, target => safeRm(target)),
  )
}

async function expectProjectSnapshot(suite: string, projectName: string, fileName: string, content: string) {
  const snapshotPath = await resolveSnapshotFile(__dirname, suite, projectName, fileName)
  await expect(content).toMatchFileSnapshot(snapshotPath)
}

function formatClassListSnapshot(classList: string[]) {
  return `${JSON.stringify(classList, null, 2)}\n`
}

const SUSPICIOUS_CLASS_FRAGMENT_RE = /\b[\w-]+-\s+[a-z0-9#]/gi
const SUSPICIOUS_XL_FRAGMENT_RE = /\b\d+xl\s+\d+xl\b/gi

function collectSuspiciousClassFragments(wxml: string) {
  const matches: string[] = []
  const patterns = [
    SUSPICIOUS_CLASS_FRAGMENT_RE,
    SUSPICIOUS_XL_FRAGMENT_RE,
  ]

  for (const pattern of patterns) {
    pattern.lastIndex = 0
    matches.push(...(wxml.match(pattern) ?? []))
  }

  return [...new Set(matches)]
}

function countSuspiciousClassFragments(wxml: string) {
  return collectSuspiciousClassFragments(wxml).length
}

async function captureStablePageWxml(
  page: any,
  options: StableWxmlOptions = {},
) {
  const timeoutMs = options.timeoutMs ?? 3000
  const intervalMs = options.intervalMs ?? 120
  const stableRounds = options.stableRounds ?? 2
  const settleMs = options.settleMs ?? 800
  const deadline = Date.now() + timeoutMs

  if (settleMs > 0) {
    await page.waitFor(settleMs)
  }

  let latest = ''
  let previous = ''
  let stableCount = 0
  let best = ''
  let bestScore = Number.POSITIVE_INFINITY

  while (Date.now() < deadline) {
    const pageEl = await page.$('page')
    const current = await pageEl?.wxml() ?? ''
    latest = current
    const suspiciousScore = countSuspiciousClassFragments(current)

    if (
      current.length > 0
      && (suspiciousScore < bestScore || (suspiciousScore === bestScore && current !== best))
    ) {
      best = current
      bestScore = suspiciousScore
    }

    if (current.length > 0 && current === previous) {
      stableCount += 1
      if (stableCount >= stableRounds && suspiciousScore === 0) {
        return current
      }
    }
    else {
      stableCount = 0
      previous = current
    }

    await page.waitFor(intervalMs)
  }

  return best || latest
}

async function runProjectTest(entry: ProjectEntry, options: ProjectTestOptions) {
  const projectBase = path.resolve(__dirname, options.fixturesDir)
  const projectPath = path.resolve(projectBase, entry.projectPath)
  const root = path.resolve(projectBase, entry.name)
  const shouldResetPatchCaches = !entry.name.startsWith('taro-')

  if (shouldResetPatchCaches) {
    await clearTailwindPatchCaches(root)
  }

  if (process.env.E2E_SKIP_BUILD !== '1') {
    await ensureProjectBuilt(root)
  }

  if (shouldResetPatchCaches) {
    await clearTailwindPatchCaches(root)
  }

  let extraction
  if (options.allowExtractionFailure) {
    try {
      extraction = await twExtract(root)
    }
    catch {
      extraction = undefined
    }
  }
  else {
    extraction = await twExtract(root)
  }

  const outputFilename = extraction?.output?.filename ?? path.resolve(root, '.tw-patch/tw-class-list.json')
  const classListSnapshot = extraction?.classList ? formatClassListSnapshot(extraction.classList) : undefined

  let json: string
  if (classListSnapshot) {
    json = classListSnapshot
  }
  else {
    try {
      json = await fs.readFile(outputFilename, 'utf8')
    }
    catch (error: any) {
      const code = error?.code
      if (code && ['ENOENT', 'EPERM'].includes(code)) {
        json = formatClassListSnapshot([])
      }
      else {
        throw error
      }
    }
  }

  await expectProjectSnapshot(options.suite, entry.name, 'tw-class-list.json', json)

  const cssSnapshots = await collectCssSnapshots(projectPath, entry.cssFile)
  for (const snapshot of cssSnapshots) {
    await expectProjectSnapshot(options.suite, entry.name, snapshot.fileName, snapshot.content)
  }

  if (entry.skipOpenAutomator) {
    await wait()
    return
  }

  let miniProgram: any
  try {
    miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
  }
  catch (error: any) {
    if (error?.code === 'EPERM' || EPERM_RE.test(error?.message ?? '')) {
      await wait()
      return
    }
    throw error
  }

  try {
    const page = await miniProgram.reLaunch(entry.url ?? '/pages/index/index')

    if (page) {
      let wxml = await captureStablePageWxml(page)
      if (wxml) {
        wxml = removeWxmlId(wxml)
        try {
          wxml = await formatWxml(wxml)
        }
        catch {
          logE2EError('Failed to format WXML for %s', entry.projectPath)
        }

        const suspiciousFragments = collectSuspiciousClassFragments(wxml)
        if (suspiciousFragments.length > 0) {
          logE2EError(
            '[e2e] suspicious class fragments detected in %s/page.wxml: %s',
            entry.name,
            suspiciousFragments.join(', '),
          )
        }

        await expectProjectSnapshot(options.suite, entry.name, 'page.wxml', wxml)
      }

      await page.waitFor(1000)
    }
  }
  finally {
    await miniProgram?.close()
  }

  await wait()
}

const buildTasks = new Map<string, Promise<void>>()

export async function ensureProjectBuilt(root: string) {
  const existing = buildTasks.get(root)
  if (existing) {
    return existing
  }

  const task = (async () => {
    let pkg: { name?: string, scripts?: Record<string, string> } | undefined
    const pkgPath = path.resolve(root, 'package.json')
    try {
      const content = await fs.readFile(pkgPath, 'utf8')
      pkg = JSON.parse(content)
    }
    catch {
      return
    }

    const buildScript = pkg?.scripts?.build
    if (!buildScript) {
      return
    }

    const stdio = process.env.E2E_DEBUG_BUILD === '1' ? 'inherit' : 'pipe'
    const childEnv: Record<string, string | undefined> = {
      ...process.env,
      // Vitest workers set NODE_ENV=test; Taro + Vite builds are not stable in that mode.
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      RUST_BACKTRACE: process.env.RUST_BACKTRACE ?? '1',
      npm_package_json: pkgPath,
      PNPM_PACKAGE_NAME: pkg?.name ?? process.env.PNPM_PACKAGE_NAME,
      INIT_CWD: root,
    }

    delete childEnv.VITEST
    for (const key of Object.keys(childEnv)) {
      if (key.startsWith('VITEST_')) {
        delete childEnv[key]
      }
    }

    try {
      await execa('pnpm', ['run', 'build'], {
        cwd: root,
        env: childEnv,
        stdio,
      })
    }
    catch (error) {
      if (stdio !== 'inherit') {
        logE2EError('[e2e] build failed in %s: %o', root, error)
      }
      throw error
    }
  })()

  buildTasks.set(root, task)
  try {
    await task
  }
  catch (error) {
    buildTasks.delete(root)
    throw error
  }
}

export function defineProjectTest(entry: ProjectEntry, options: ProjectTestOptions) {
  const filtered = projectFilter([entry])
  const activeEntry = filtered[0] ?? entry
  const register = filtered.length > 0 ? it : it.skip
  const describeTitle = options.describeTitle ?? options.suite

  describe(describeTitle, () => {
    register(activeEntry.name, async () => {
      await runProjectTest(activeEntry, options)
    })
  })
}
