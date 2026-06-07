import type { Browser, Page } from 'playwright'
import type { CliOptions, WatchCase, WatchSession } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types.ts'
import type { CaseResult, MiniProgramHmrMutation, MiniProgramHmrVisualConfig, RuntimeContext } from './types.ts'
import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import path from 'pathe'
import { collectArtifactMtimes, hasAnyNeedle, readArtifacts } from '../../e2e/frameworkIdeHotUpdateArtifacts.ts'
import { getDevToolsRelaunchTimeoutMs, readPageLiveContent } from '../../e2e/frameworkIdeLivePage.ts'
import { ensureProjectBuilt } from '../../e2e/projectBuild.ts'
import {
  waitForInitialWarmup,
  waitForMarkerState,
  waitForOutputFilesUpdated,
  waitForOutputsReady,
} from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/index.ts'
import { createWatchSession, runPnpmCommand, sleep } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session.ts'
import { capturePageScreenshot, prepareScreenshotPage, screenshotPage } from './browser.ts'
import { findFreePort, killProcessTree, spawnPnpm, waitForUrl } from './process.ts'

export interface H5Case {
  name: string
  projectDir: string
  command: string[]
  env?: Record<string, string | undefined>
  hmr?: H5HmrVisualConfig
}

export interface H5HmrVisualConfig {
  label: string
  mutate: (projectRoot: string) => Promise<() => Promise<void>>
  waitForReady?: (page: Page, url: string, logs: string[]) => Promise<Record<string, unknown> | undefined>
  waitForUpdate: (page: Page, url: string, logs: string[]) => Promise<Record<string, unknown> | undefined>
}

export interface MiniProgramCase {
  name: string
  projectPath: string
  url?: string
  skipOpenAutomator?: boolean
  hmr?: MiniProgramHmrVisualConfig
}

function resolveScreenshotPath(context: RuntimeContext, name: string, platform: CaseResult['platform']) {
  return path.join(context.artifactRoot, 'screenshots', name, `${platform}.png`)
}

function resolveHmrScreenshotPath(context: RuntimeContext, name: string, platform: CaseResult['platform'], phase: 'before' | 'after') {
  return path.join(context.artifactRoot, 'screenshots', name, `${platform}-hmr-${phase}.png`)
}

export async function runH5Case(browser: Browser, item: H5Case, context: RuntimeContext, results: CaseResult[]) {
  const projectRoot = path.resolve(context.repoRoot, item.projectDir)
  const screenshot = resolveScreenshotPath(context, item.name, 'h5')
  const hmrBeforeScreenshot = resolveHmrScreenshotPath(context, item.name, 'h5', 'before')
  const hmrAfterScreenshot = resolveHmrScreenshotPath(context, item.name, 'h5', 'after')
  const port = await findFreePort()
  const command = createPortAwareCommand(item.command, port)
  const { child, logs } = spawnPnpm(projectRoot, command, {
    HOST: '127.0.0.1',
    PORT: String(port),
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    UNI_CLI_SERVER_PORT: String(port),
    ...item.env,
  })
  let restoreSource: (() => Promise<void>) | undefined
  try {
    const url = `http://127.0.0.1:${port}/`
    const resolvedUrl = await waitForUrl(url, child, logs, context.timeoutMs)
    if (!item.hmr) {
      const captured = await screenshotPage(browser, resolvedUrl, screenshot, item.name, context)
      results.push({
        name: item.name,
        platform: 'h5',
        status: 'passed',
        screenshot: captured.screenshot,
        diagnostics: captured,
      })
      return
    }

    const { diagnostics, page } = await prepareScreenshotPage(browser, resolvedUrl, context)
    try {
      const initialEvidence = await item.hmr.waitForReady?.(page, resolvedUrl, logs)
      const before = await capturePageScreenshot(page, hmrBeforeScreenshot, `${item.name} hmr before`)
      restoreSource = await item.hmr.mutate(projectRoot)
      const hmrEvidence = await item.hmr.waitForUpdate(page, resolvedUrl, logs)
      const after = await capturePageScreenshot(page, hmrAfterScreenshot, `${item.name} hmr after`)
      await fs.copyFile(hmrAfterScreenshot, screenshot)
      results.push({
        name: item.name,
        platform: 'h5',
        status: 'passed',
        screenshot,
        hmrBeforeScreenshot,
        hmrAfterScreenshot,
        diagnostics: {
          after,
          before,
          console: diagnostics.console,
          hmr: {
            label: item.hmr.label,
            evidence: hmrEvidence,
            initialEvidence,
          },
          requests: diagnostics.requests,
        },
      })
    }
    finally {
      await page.close()
    }
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
    await restoreSource?.().catch(() => undefined)
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
  item: MiniProgramCase,
  context: RuntimeContext,
  results: CaseResult[],
) {
  if (item.hmr) {
    await runMiniProgramHmrCase(item, context, results)
    return
  }

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

async function runMiniProgramHmrCase(
  item: MiniProgramCase & { hmr: MiniProgramHmrVisualConfig },
  context: RuntimeContext,
  results: CaseResult[],
) {
  const watchCase = item.hmr.watchCase
  const screenshot = resolveScreenshotPath(context, item.name, 'weapp')
  const hmrBeforeScreenshot = resolveHmrScreenshotPath(context, item.name, 'weapp', 'before')
  const hmrAfterScreenshot = resolveHmrScreenshotPath(context, item.name, 'weapp', 'after')
  const route = item.url ?? '/pages/index/index'
  const caseTimeoutMs = Math.max(10_000, context.timeoutMs)
  const options = createMiniProgramHmrCliOptions(context)
  const port = await findFreePort()
  let miniProgram: any
  let session: WatchSession | undefined
  let mutation: MiniProgramHmrMutation | undefined

  if (item.skipOpenAutomator) {
    const projectPath = await resolveMiniProgramProjectPath(item, context)
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
    if (watchCase.initialBuildScript) {
      process.stdout.write(`[weapp-hmr] ${item.name}: prebuild ${watchCase.initialBuildScript}\n`)
      await runPnpmCommand(watchCase.cwd, ['run', watchCase.initialBuildScript], `demo-visual-${item.name}-prebuild`)
    }

    process.stdout.write(`[weapp-hmr] ${item.name}: watch ${watchCase.devScript}\n`)
    const sessionStartedAt = Date.now()
    session = createWatchSession(watchCase.cwd, watchCase.devScript, options, watchCase.env)
    await waitForOutputsReady(watchCase, options, session, sessionStartedAt)
    await waitForInitialWarmup(watchCase, options, session, sessionStartedAt)

    const projectPath = await resolveMiniProgramWatchProjectPath(watchCase, item, context)
    process.stdout.write(`[weapp-hmr] ${item.name}: launch ${projectPath} port=${port}\n`)
    miniProgram = await withTimeout(`${item.name} launch`, caseTimeoutMs, new Launcher().launch({
      projectPath,
      port,
      timeout: caseTimeoutMs,
    }))
    const beforePage = await relaunchMiniProgramPage(miniProgram, route, item.name, options)
    await withTimeout(`${item.name} waitFor before`, 10_000, beforePage?.waitFor?.(1000) ?? Promise.resolve())
    await withTimeout(`${item.name} hmr before screenshot`, caseTimeoutMs, captureMiniProgramScreenshot(miniProgram, hmrBeforeScreenshot, caseTimeoutMs))

    const { artifacts: baselineArtifacts, mtimes } = await collectArtifactMtimes(watchCase)
    if (watchCase.initialMutationDelayMs) {
      await sleep(watchCase.initialMutationDelayMs)
    }
    mutation = await item.hmr.mutate()
    const mutationStartedAt = Date.now()
    const outputFiles = [
      watchCase.outputWxml,
      watchCase.outputJs,
      ...watchCase.outputStyleCandidates,
      ...watchCase.globalStyleCandidates,
    ]
    await waitForOutputFilesUpdated(
      watchCase,
      outputFiles,
      mtimes,
      options,
      session,
      mutationStartedAt,
      async () => hasAnyNeedle(await readArtifacts(watchCase), [mutation!.marker]),
    )
    await waitForMarkerState(watchCase, mutation.marker, 'present', options, session, mutationStartedAt)

    const refreshDiagnostics = await refreshMiniProgramCompile(miniProgram, item.name, caseTimeoutMs)
    const afterPage = await relaunchMiniProgramPage(miniProgram, route, item.name, options)
    const liveContent = await waitForMiniProgramLiveMarker(afterPage, route, mutation.marker, options, session, mutationStartedAt)
    await withTimeout(`${item.name} waitFor after`, 10_000, afterPage?.waitFor?.(1000) ?? Promise.resolve())
    await withTimeout(`${item.name} hmr after screenshot`, caseTimeoutMs, captureMiniProgramScreenshot(miniProgram, hmrAfterScreenshot, caseTimeoutMs))
    await fs.copyFile(hmrAfterScreenshot, screenshot)

    const pageEl = await afterPage?.$('page')
    const wxml = await withTimeout(`${item.name} wxml`, 10_000, pageEl?.wxml().catch(() => '') ?? Promise.resolve(''))
    results.push({
      name: item.name,
      platform: 'weapp',
      status: 'passed',
      screenshot,
      hmrBeforeScreenshot,
      hmrAfterScreenshot,
      diagnostics: {
        hmr: {
          label: item.hmr.label,
          marker: mutation.marker,
        },
        liveContentPreview: liveContent.slice(0, 800),
        outputChangedCount: (await readArtifacts(watchCase)).filter((artifact) => {
          const baseline = baselineArtifacts.find(item => item.file === artifact.file)
          return baseline?.content !== artifact.content
        }).length,
        port,
        projectPath,
        refresh: refreshDiagnostics,
        route,
        wxmlPreview: typeof wxml === 'string' ? wxml.slice(0, 800) : '',
      },
    })
    process.stdout.write(`[weapp-hmr] ${item.name}: passed\n`)
  }
  catch (error) {
    results.push({
      name: item.name,
      platform: 'weapp',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      diagnostics: {
        hmr: {
          label: item.hmr.label,
          marker: mutation?.marker,
        },
        port,
        route,
        watchCase: watchCase.name,
      },
    })
  }
  finally {
    await mutation?.restore().catch(() => undefined)
    await withTimeout(`${item.name} close`, 10_000, miniProgram?.close?.().catch(() => undefined) ?? Promise.resolve())
      .catch(() => undefined)
    await session?.stop().catch(() => undefined)
  }
}

function createMiniProgramHmrCliOptions(context: RuntimeContext): CliOptions {
  return {
    caseName: 'all',
    pollMs: Number(process.env['DEMO_VISUAL_HMR_POLL_MS'] ?? 80),
    quietSass: true,
    skipBuild: true,
    timeoutMs: context.timeoutMs,
    webOnly: false,
  }
}

async function relaunchMiniProgramPage(miniProgram: any, route: string, name: string, options: CliOptions) {
  process.stdout.write(`[weapp-hmr] ${name}: reLaunch ${route}\n`)
  return await withTimeout(`${name} reLaunch`, getDevToolsRelaunchTimeoutMs(options), miniProgram.reLaunch(route))
}

async function refreshMiniProgramCompile(miniProgram: any, name: string, timeoutMs: number) {
  const diagnostics: Record<string, string> = {}
  await runMiniProgramBestEffort(`${name} clearCache`, 10_000, diagnostics, 'clearCache', () => {
    return miniProgram?.clearCache?.({ clean: 'compile' })
  })
  if (typeof miniProgram?.compile === 'function') {
    await runMiniProgramBestEffort(`${name} compile`, timeoutMs, diagnostics, 'compile', () => {
      return miniProgram.compile({ force: true })
    })
  }
  return diagnostics
}

async function runMiniProgramBestEffort(
  label: string,
  timeoutMs: number,
  diagnostics: Record<string, string>,
  key: string,
  task: () => unknown,
) {
  try {
    await withTimeout(label, timeoutMs, Promise.resolve(task()))
  }
  catch (error) {
    diagnostics[key] = error instanceof Error ? error.message : String(error)
  }
}

async function waitForMiniProgramLiveMarker(
  page: any,
  route: string,
  marker: string,
  options: CliOptions,
  session: WatchSession,
  startedAt: number,
) {
  let latestContent = ''
  let lastError = ''
  while (Date.now() - startedAt < options.timeoutMs) {
    try {
      session.ensureRunning()
      latestContent = await readPageLiveContent(page, route)
      if (latestContent.includes(marker)) {
        return latestContent
      }
      lastError = 'marker is not visible yet'
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await sleep(options.pollMs)
  }
  throw new Error(`[${route}] live page marker was not visible after HMR: ${lastError}`)
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

async function resolveMiniProgramWatchProjectPath(
  watchCase: WatchCase,
  item: { name: string, projectPath: string },
  context: RuntimeContext,
) {
  for (const candidate of createMiniProgramProjectPathCandidates(item, context)) {
    if (await isProjectConfigCoveringOutput(candidate, watchCase.outputWxml)) {
      return candidate
    }
  }
  const outputProjectPath = await findAncestorWithProjectConfig(path.dirname(watchCase.outputWxml))
  if (outputProjectPath) {
    return outputProjectPath
  }
  return await resolveMiniProgramProjectPath(item, context)
}

async function isProjectConfigCoveringOutput(projectPath: string, outputFile: string) {
  const projectConfigFile = path.resolve(projectPath, 'project.config.json')
  let projectConfig: { miniprogramRoot?: string, srcMiniprogramRoot?: string }
  try {
    projectConfig = JSON.parse(await fs.readFile(projectConfigFile, 'utf8'))
  }
  catch {
    return false
  }

  const roots = [
    projectPath,
    projectConfig.miniprogramRoot ? path.resolve(projectPath, projectConfig.miniprogramRoot) : undefined,
    projectConfig.srcMiniprogramRoot ? path.resolve(projectPath, projectConfig.srcMiniprogramRoot) : undefined,
  ].filter((item): item is string => Boolean(item))

  return roots.some(root => isPathInside(outputFile, root))
}

function isPathInside(file: string, dir: string) {
  const relative = path.relative(path.resolve(dir), path.resolve(file))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

async function findAncestorWithProjectConfig(startDir: string) {
  let current = path.resolve(startDir)
  while (true) {
    try {
      await fs.access(path.resolve(current, 'project.config.json'))
      return current
    }
    catch {
    }
    const parent = path.dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
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
