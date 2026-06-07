import type { Browser } from 'playwright'
import type { CaseResult, RuntimeContext } from './types.ts'
import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import path from 'pathe'
import { ensureProjectBuilt } from '../../e2e/projectBuild.ts'
import { screenshotPage } from './browser.ts'
import { findFreePort, killProcessTree, spawnPnpm, waitForUrl } from './process.ts'

interface H5Case {
  name: string
  projectDir: string
  command: string[]
  env?: Record<string, string | undefined>
}

function resolveScreenshotPath(context: RuntimeContext, name: string, platform: CaseResult['platform']) {
  return path.join(context.artifactRoot, 'screenshots', name, `${platform}.png`)
}

export async function runH5Case(browser: Browser, item: H5Case, context: RuntimeContext, results: CaseResult[]) {
  const projectRoot = path.resolve(context.repoRoot, item.projectDir)
  const screenshot = resolveScreenshotPath(context, item.name, 'h5')
  const port = await findFreePort()
  const command = createPortAwareCommand(item.command, port)
  const { child, logs } = spawnPnpm(projectRoot, command, {
    HOST: '127.0.0.1',
    PORT: String(port),
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    UNI_CLI_SERVER_PORT: String(port),
    ...item.env,
  })
  try {
    const url = `http://127.0.0.1:${port}/`
    const resolvedUrl = await waitForUrl(url, child, logs, context.timeoutMs)
    const captured = await screenshotPage(browser, resolvedUrl, screenshot, item.name, context)
    results.push({
      name: item.name,
      platform: 'h5',
      status: 'passed',
      screenshot: captured.screenshot,
      diagnostics: captured,
    })
  }
  catch (error) {
    results.push({
      name: item.name,
      platform: 'h5',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    })
  }
  finally {
    killProcessTree(child)
  }
}

function createPortAwareCommand(command: string[], port: number) {
  if (command.includes('--port')) {
    return command
  }
  if (command.includes('vite') || command.includes('taro')) {
    return [...command, '--port', String(port)]
  }
  return command
}

async function withTimeout<T>(label: string, timeoutMs: number, task: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} 超时 ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

async function captureMiniProgramScreenshot(miniProgram: any, screenshot: string, timeoutMs: number) {
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  if (typeof miniProgram?.send === 'function') {
    const result = await miniProgram.send('App.captureScreenshot', {}, { timeout: timeoutMs })
    if (typeof result?.data === 'string') {
      await fs.writeFile(screenshot, result.data, 'base64')
      return
    }
  }
  await miniProgram.screenshot({ path: screenshot })
}

export async function runMiniProgramCase(
  item: { name: string, projectPath: string, url?: string, skipOpenAutomator?: boolean },
  context: RuntimeContext,
  results: CaseResult[],
) {
  await ensureMiniProgramProjectBuilt(item, context)
  const projectPath = await resolveMiniProgramProjectPath(item, context)
  const screenshot = resolveScreenshotPath(context, item.name, 'weapp')
  const route = item.url ?? '/pages/index/index'
  const caseTimeoutMs = Math.max(10_000, context.timeoutMs)
  const port = await findFreePort()
  let miniProgram: any
  if (item.skipOpenAutomator) {
    results.push({
      name: item.name,
      platform: 'weapp',
      status: 'skipped',
      error: 'project entry 标记为 skipOpenAutomator',
      diagnostics: { projectPath, route },
    })
    return
  }
  try {
    process.stdout.write(`[weapp] ${item.name}: launch ${projectPath} port=${port}\n`)
    miniProgram = await withTimeout(`${item.name} launch`, caseTimeoutMs, new Launcher().launch({
      projectPath,
      port,
      timeout: caseTimeoutMs,
    }))
    process.stdout.write(`[weapp] ${item.name}: reLaunch ${route}\n`)
    const page = await withTimeout(`${item.name} reLaunch`, caseTimeoutMs, miniProgram.reLaunch(route))
    await withTimeout(`${item.name} waitFor`, 10_000, page?.waitFor?.(1000) ?? Promise.resolve())
    process.stdout.write(`[weapp] ${item.name}: screenshot\n`)
    await withTimeout(`${item.name} screenshot`, caseTimeoutMs, captureMiniProgramScreenshot(miniProgram, screenshot, caseTimeoutMs))
    const pageEl = await page?.$('page')
    const wxml = await withTimeout(`${item.name} wxml`, 10_000, pageEl?.wxml().catch(() => '') ?? Promise.resolve(''))
    results.push({
      name: item.name,
      platform: 'weapp',
      status: 'passed',
      screenshot,
      diagnostics: {
        projectPath,
        port,
        route,
        wxmlPreview: typeof wxml === 'string' ? wxml.slice(0, 800) : '',
      },
    })
    process.stdout.write(`[weapp] ${item.name}: passed\n`)
  }
  catch (error) {
    results.push({
      name: item.name,
      platform: 'weapp',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      diagnostics: { projectPath, port, route },
    })
  }
  finally {
    await withTimeout(`${item.name} close`, 10_000, miniProgram?.close?.().catch(() => undefined) ?? Promise.resolve())
      .catch(() => undefined)
  }
}

async function ensureMiniProgramProjectBuilt(
  item: { name: string, projectPath: string, skipOpenAutomator?: boolean },
  context: RuntimeContext,
) {
  if (item.skipOpenAutomator) {
    return
  }
  for (const candidate of createMiniProgramProjectPathCandidates(item, context)) {
    if (await isMiniProgramOutputReady(candidate)) {
      return
    }
  }
  const root = path.resolve(context.repoRoot, 'demo', item.name)
  try {
    await fs.access(path.resolve(root, 'package.json'))
  }
  catch {
    return
  }
  process.stdout.write(`[weapp] ${item.name}: build ${root}\n`)
  await ensureProjectBuilt(root)
}

async function isMiniProgramOutputReady(outputRoot: string) {
  const requiredFiles = [
    'app.json',
    'project.config.json',
    'pages/index/index.js',
    'pages/index/index.json',
    'pages/index/index.wxml',
  ]
  const ready = await Promise.all(
    requiredFiles.map(async (file) => {
      try {
        await fs.access(path.resolve(outputRoot, file))
        return true
      }
      catch {
        return false
      }
    }),
  )
  return ready.every(Boolean)
}

async function resolveMiniProgramProjectPath(
  item: { name: string, projectPath: string },
  context: RuntimeContext,
) {
  const candidates = createMiniProgramProjectPathCandidates(item, context)
  for (const candidate of candidates) {
    try {
      await fs.access(path.resolve(candidate, 'project.config.json'))
      return candidate
    }
    catch {
    }
  }
  return candidates[0]
}

function createMiniProgramProjectPathCandidates(
  item: { name: string, projectPath: string },
  context: RuntimeContext,
) {
  return [
    path.resolve(context.repoRoot, 'demo', item.projectPath),
    path.resolve(context.repoRoot, 'demo', item.name, 'dist/build/mp-weixin'),
    path.resolve(context.repoRoot, 'demo', item.name, 'dist/dev/mp-weixin'),
    path.resolve(context.repoRoot, 'demo', item.name, 'unpackage/dist/dev/mp-weixin'),
    path.resolve(context.repoRoot, 'demo', item.name),
    path.resolve(context.repoRoot, 'demo', item.name, 'static/wx'),
  ]
}
