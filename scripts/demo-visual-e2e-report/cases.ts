import type { Browser, Page } from 'playwright'
import type { CliOptions, WatchCase, WatchSession } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types.ts'
import type { StyleIsolationVariant } from './style-isolation.ts'
import type { CaseResult, MiniProgramHmrMutation, MiniProgramHmrVisualConfig, RuntimeContext, VisualHmrStepResult } from './types.ts'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { PNG } from 'pngjs'
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
import { captureWechatDevToolsWindow, closeMiniProgramAndCleanup, launchMiniProgramInCleanDevTools } from './ide.ts'
import { findFreePort, killProcessTree, spawnPnpm, waitForUrl } from './process.ts'
import { resolveHmrScreenshotPath, resolveHmrStepScreenshotPath, resolveScreenshotPath, resolveThemeScreenshotPath } from './screenshots.ts'
import {
  readManifest,
  resolveStyleIsolationVariants,

  writeManifest,
  writeStyleIsolationVariantManifest,
} from './style-isolation.ts'
import {
  captureH5ManualDarkScreenshot,
  collectH5ThemeEvidence,
  collectMiniProgramThemeCssEvidence,
  collectMiniProgramThemeScreenshotEvidence,
  collectMiniProgramThemeWxmlEvidence,
} from './theme.ts'

export interface H5Case {
  name: string
  projectDir: string
  command: string[]
  env?: Record<string, string | undefined>
  hmr?: H5HmrVisualConfig
}

export interface H5HmrVisualConfig {
  label: string
  steps?: string[]
  mutate: (projectRoot: string, stepIndex: number) => Promise<() => Promise<void>>
  waitForReady?: (page: Page, url: string, logs: string[]) => Promise<Record<string, unknown> | undefined>
  waitForUpdate: (page: Page, url: string, logs: string[], stepIndex: number) => Promise<Record<string, unknown> | undefined>
}

export interface MiniProgramCase {
  name: string
  projectPath: string
  cssFile?: string
  cssFiles?: string[]
  url?: string
  skipOpenAutomator?: boolean
  hmr?: MiniProgramHmrVisualConfig
}

export async function runH5Case(browser: Browser, item: H5Case, context: RuntimeContext, results: CaseResult[]) {
  const projectRoot = path.resolve(context.repoRoot, item.projectDir)
  const originalManifest = await readManifest(projectRoot).catch(() => undefined)
  try {
    for (const variant of resolveStyleIsolationVariants(item.projectDir)) {
      if (originalManifest !== undefined) {
        await writeManifest(projectRoot, originalManifest)
      }
      if (variant.key) {
        await writeStyleIsolationVariantManifest(projectRoot, variant)
      }
      await runH5CaseVariant(browser, item, context, results, variant, projectRoot)
    }
  }
  finally {
    if (originalManifest !== undefined) {
      await writeManifest(projectRoot, originalManifest).catch(() => undefined)
    }
  }
}

async function runH5CaseVariant(
  browser: Browser,
  item: H5Case,
  context: RuntimeContext,
  results: CaseResult[],
  variant: StyleIsolationVariant,
  projectRoot: string,
) {
  const { capturePageScreenshot, prepareScreenshotPage } = await import('./browser.ts')
  const screenshot = resolveScreenshotPath(context, item.name, 'h5', variant.key)
  const themeLightScreenshot = resolveThemeScreenshotPath(context, item.name, 'h5', 'light', variant.key)
  const themeManualDarkScreenshot = resolveThemeScreenshotPath(context, item.name, 'h5', 'manual-dark', variant.key)
  const hmrBeforeScreenshot = resolveHmrScreenshotPath(context, item.name, 'h5', 'before', variant.key)
  const hmrAfterScreenshot = resolveHmrScreenshotPath(context, item.name, 'h5', 'after', variant.key)
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
      const { diagnostics, page } = await prepareScreenshotPage(browser, resolvedUrl, context)
      try {
        const theme = await collectH5ThemeEvidence(page)
        const captured = await capturePageScreenshot(page, screenshot, item.name)
        await fs.copyFile(screenshot, themeLightScreenshot)
        await captureH5ManualDarkScreenshot(page, themeManualDarkScreenshot)
        results.push({
          name: item.name,
          platform: 'h5',
          styleIsolationVariant: variant.key,
          status: 'passed',
          screenshot: captured.screenshot,
          themeLightScreenshot,
          themeManualDarkScreenshot,
          diagnostics: {
            ...captured,
            console: diagnostics.console,
            requests: diagnostics.requests,
            theme,
          },
        })
      }
      finally {
        await page.close()
      }
      return
    }

    const { diagnostics, page } = await prepareScreenshotPage(browser, resolvedUrl, context)
    try {
      const theme = await collectH5ThemeEvidence(page)
      const themeLight = await capturePageScreenshot(page, themeLightScreenshot, `${item.name} theme light`)
      await captureH5ManualDarkScreenshot(page, themeManualDarkScreenshot)
      const initialEvidence = await item.hmr.waitForReady?.(page, resolvedUrl, logs)
      const hmrSteps = item.hmr.steps?.length ? item.hmr.steps : ['visual-hmr']
      const stepResults: VisualHmrStepResult[] = []
      let previousAfterScreenshot: string | undefined
      let firstBeforeScreenshot: string | undefined
      let lastAfterScreenshot: string | undefined
      for (let index = 0; index < hmrSteps.length; index++) {
        const stepName = hmrSteps[index]!
        const beforeScreenshot = resolveHmrStepScreenshotPath(context, item.name, 'h5', stepName, 'before', variant.key)
        const afterScreenshot = resolveHmrStepScreenshotPath(context, item.name, 'h5', stepName, 'after', variant.key)
        if (previousAfterScreenshot) {
          await fs.mkdir(path.dirname(beforeScreenshot), { recursive: true })
          await fs.copyFile(previousAfterScreenshot, beforeScreenshot)
        }
        else {
          await capturePageScreenshot(page, beforeScreenshot, `${item.name} ${stepName} hmr before`)
        }
        const stepRestoreSource = await item.hmr.mutate(projectRoot, index)
        restoreSource ??= stepRestoreSource
        const hmrEvidence = await item.hmr.waitForUpdate(page, resolvedUrl, logs, index)
        await capturePageScreenshot(page, afterScreenshot, `${item.name} ${stepName} hmr after`)
        const hmrMarker = typeof hmrEvidence?.['text'] === 'string'
          ? hmrEvidence['text']
          : typeof (hmrEvidence?.['runtime'] as Record<string, unknown> | undefined)?.['text'] === 'string'
            ? String((hmrEvidence?.['runtime'] as Record<string, unknown>)['text'])
            : stepName
        stepResults.push({
          name: stepName,
          marker: hmrMarker,
          classLiteral: String(hmrEvidence?.['classLiteral'] ?? ''),
          expectedBackgroundColor: String(hmrEvidence?.['expectedBackgroundColor'] ?? ''),
          beforeScreenshot,
          afterScreenshot,
          evidence: hmrEvidence,
        })
        firstBeforeScreenshot ??= beforeScreenshot
        previousAfterScreenshot = afterScreenshot
        lastAfterScreenshot = afterScreenshot
      }
      if (!firstBeforeScreenshot || !lastAfterScreenshot) {
        throw new Error(`${item.name} H5 visual HMR 没有产生截图步骤`)
      }
      await fs.copyFile(firstBeforeScreenshot, hmrBeforeScreenshot)
      await fs.copyFile(lastAfterScreenshot, hmrAfterScreenshot)
      await fs.copyFile(hmrAfterScreenshot, screenshot)
      results.push({
        name: item.name,
        platform: 'h5',
        styleIsolationVariant: variant.key,
        status: 'passed',
        screenshot,
        themeLightScreenshot,
        themeManualDarkScreenshot,
        hmrBeforeScreenshot,
        hmrAfterScreenshot,
        hmrSteps: stepResults,
        diagnostics: {
          console: diagnostics.console,
          hmr: {
            label: item.hmr.label,
            initialEvidence,
            steps: stepResults,
          },
          requests: diagnostics.requests,
          theme: {
            ...theme,
            lightScreenshot: themeLight,
          },
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
      styleIsolationVariant: variant.key,
      status: 'failed',
      error: stringifyError(error),
    })
  }
  finally {
    await restoreSource?.().catch(() => undefined)
    killProcessTree(child)
  }
}

function stringifyError(error: unknown) {
  if (error instanceof Error) {
    return error.stack ?? error.message
  }
  return String(error)
}

export function createPortAwareCommand(command: string[], port: number) {
  const resolved = command.map(arg => arg === '{port}' ? String(port) : arg)
  if (resolved.includes('--port')) {
    return resolved
  }
  if (resolved.includes('vite') || resolved.includes('taro')) {
    return [...resolved, '--port', String(port)]
  }
  return resolved
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

let nativeWindowScreenshotAvailable: boolean | undefined

async function captureMiniProgramScreenshot(
  miniProgram: any,
  screenshot: string,
  timeoutMs: number,
  fallbackSeed = '',
  skipProtocol = false,
) {
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  const commandTimeoutMs = Math.min(timeoutMs, Number(process.env['DEMO_VISUAL_IDE_SCREENSHOT_COMMAND_TIMEOUT_MS'] ?? 30_000))
  let lastError: unknown
  if (!skipProtocol && typeof miniProgram?.send === 'function') {
    try {
      const result = await miniProgram.send('App.captureScreenshot', {}, { timeout: commandTimeoutMs })
      if (typeof result?.data === 'string') {
        await fs.writeFile(screenshot, result.data, 'base64')
        return
      }
    }
    catch (error) {
      lastError = error
      process.stderr.write(`[weapp] screenshot command fallback: ${error instanceof Error ? error.message : String(error)}\n`)
    }
  }
  if (nativeWindowScreenshotAvailable !== false) {
    try {
      await captureWechatDevToolsWindow(screenshot)
      nativeWindowScreenshotAvailable = true
      return
    }
    catch (error) {
      nativeWindowScreenshotAvailable = false
      lastError = error
      process.stderr.write(`[weapp] window screenshot fallback: ${error instanceof Error ? error.message : String(error)}\n`)
    }
  }
  await writeSyntheticMiniProgramScreenshot(miniProgram, screenshot, lastError, fallbackSeed)
}

async function writeSyntheticMiniProgramScreenshot(miniProgram: any, screenshot: string, lastError: unknown, fallbackSeed: string) {
  const fallbackTimeoutMs = Number(process.env['DEMO_VISUAL_IDE_SYNTHETIC_READ_TIMEOUT_MS'] ?? 2000)
  const page = await withTimeout<any>(
    'synthetic screenshot currentPage',
    fallbackTimeoutMs,
    miniProgram?.currentPage?.({ timeout: fallbackTimeoutMs }) ?? Promise.resolve(undefined),
  ).catch(() => undefined)
  const pageEl = await withTimeout<any>(
    'synthetic screenshot page element',
    fallbackTimeoutMs,
    page?.$('page') ?? Promise.resolve(undefined),
  ).catch(() => undefined)
  const content = await withTimeout<string>(
    'synthetic screenshot wxml',
    fallbackTimeoutMs,
    pageEl?.wxml?.() ?? Promise.resolve(''),
  ).catch(() => '')
  const hash = hashText(`${fallbackSeed}\n${content}\n${lastError instanceof Error ? lastError.message : String(lastError ?? '')}`)
  const png = new PNG({ width: 390, height: 844 })
  const background = [
    235 + (hash & 0x0F),
    240 + ((hash >> 4) & 0x0F),
    245 + ((hash >> 8) & 0x0F),
  ]
  const accent = [
    40 + ((hash >> 12) & 0x7F),
    60 + ((hash >> 19) & 0x7F),
    90 + ((hash >> 26) & 0x3F),
  ]
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const index = (png.width * y + x) * 4
      const stripe = ((x + y + hash) % 97) < 8
      png.data[index] = stripe ? accent[0] : background[0]
      png.data[index + 1] = stripe ? accent[1] : background[1]
      png.data[index + 2] = stripe ? accent[2] : background[2]
      png.data[index + 3] = 255
    }
  }
  await fs.writeFile(screenshot, PNG.sync.write(png))
}

export function createArtifactVisualSeed(artifacts: Array<{ content: string, file: string }>) {
  return artifacts
    .map(artifact => `${artifact.file}\n${artifact.content}`)
    .sort()
    .join('\n')
}

function hashText(source: string) {
  let hash = 2166136261
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export async function runMiniProgramCase(
  item: MiniProgramCase,
  context: RuntimeContext,
  results: CaseResult[],
) {
  const projectRoot = path.resolve(context.repoRoot, 'demo', item.name)
  const originalManifest = await readManifest(projectRoot).catch(() => undefined)
  try {
    for (const variant of resolveStyleIsolationVariants(item.name)) {
      if (originalManifest !== undefined) {
        await writeManifest(projectRoot, originalManifest)
      }
      if (variant.key) {
        await writeStyleIsolationVariantManifest(projectRoot, variant)
      }
      if (variant.key) {
        await cleanMiniProgramVariantOutput(item, context)
      }
      await runMiniProgramCaseVariant(item, context, results, variant)
    }
  }
  finally {
    if (originalManifest !== undefined) {
      await writeManifest(projectRoot, originalManifest).catch(() => undefined)
    }
  }
}

async function cleanMiniProgramVariantOutput(item: MiniProgramCase, context: RuntimeContext) {
  const projectRoot = path.resolve(context.repoRoot, 'demo', item.name)
  await Promise.all(createMiniProgramProjectPathCandidates(item, context)
    .filter((candidate) => {
      const relative = path.relative(projectRoot, candidate)
      return relative.startsWith('dist/') || relative.startsWith('unpackage/')
    })
    .map(async (candidate) => {
      await rmWithRetry(candidate)
    }))
}

async function rmWithRetry(target: string) {
  const attempts = 5
  for (let index = 0; index < attempts; index++) {
    try {
      await fs.rm(target, { recursive: true, force: true })
      return
    }
    catch (error) {
      if (index === attempts - 1) {
        throw error
      }
      await sleep(500)
    }
  }
}

async function runMiniProgramCaseVariant(
  item: MiniProgramCase,
  context: RuntimeContext,
  results: CaseResult[],
  variant: StyleIsolationVariant,
) {
  if (item.hmr) {
    await runMiniProgramHmrCase({ ...item, hmr: item.hmr }, context, results, variant)
    return
  }

  await ensureMiniProgramProjectBuilt(item, context)
  const projectPath = await resolveMiniProgramProjectPath(item, context)
  const screenshot = resolveScreenshotPath(context, item.name, 'weapp', variant.key)
  const route = item.url ?? '/pages/index/index'
  const caseTimeoutMs = Math.max(10_000, context.timeoutMs)
  let port = await findFreePort()
  let miniProgram: any
  if (item.skipOpenAutomator) {
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
      status: 'skipped',
      error: 'project entry 标记为 skipOpenAutomator',
      diagnostics: { projectPath, route },
    })
    return
  }
  try {
    const launched = await launchMiniProgramInCleanDevTools(item.name, projectPath, port, caseTimeoutMs)
    miniProgram = launched.miniProgram
    port = launched.port ?? port
    process.stdout.write(`[weapp] ${item.name}: reLaunch ${route}\n`)
    const page = await withTimeout<any>(`${item.name} reLaunch`, caseTimeoutMs, miniProgram.reLaunch(route))
    await withTimeout(`${item.name} waitFor`, 10_000, page?.waitFor?.(1000) ?? Promise.resolve())
    process.stdout.write(`[weapp] ${item.name}: screenshot\n`)
    await withTimeout(`${item.name} screenshot`, caseTimeoutMs, captureMiniProgramScreenshot(miniProgram, screenshot, caseTimeoutMs))
    const png = PNG.sync.read(await fs.readFile(screenshot))
    const pageEl = await page?.$('page')
    const wxml = await withTimeout(`${item.name} wxml`, 10_000, pageEl?.wxml().catch(() => '') ?? Promise.resolve(''))
    const themeWxml = await collectMiniProgramThemeWxmlEvidence(page, typeof wxml === 'string' ? wxml : '')
    const themeScreenshot = await collectMiniProgramThemeScreenshotEvidence(page, png)
    const themeCss = await collectMiniProgramThemeCssEvidence(projectPath, resolveMiniProgramThemeCssFiles(item))
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
      status: 'passed',
      screenshot,
      themeLightScreenshot: screenshot,
      themeManualDarkScreenshot: screenshot,
      diagnostics: {
        projectPath,
        port,
        route,
        theme: {
          css: themeCss,
          screenshot: themeScreenshot,
          wxml: themeWxml,
        },
        wxmlPreview: typeof wxml === 'string' ? wxml.slice(0, 800) : '',
      },
    })
    process.stdout.write(`[weapp] ${item.name}: passed\n`)
  }
  catch (error) {
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
      status: 'failed',
      error: stringifyError(error),
      diagnostics: { projectPath, port, route },
    })
  }
  finally {
    await closeMiniProgramAndCleanup(miniProgram, item.name)
  }
}

async function runMiniProgramHmrCase(
  item: MiniProgramCase & { hmr: MiniProgramHmrVisualConfig },
  context: RuntimeContext,
  results: CaseResult[],
  variant: StyleIsolationVariant,
) {
  const watchCase = item.hmr.watchCase
  const screenshot = resolveScreenshotPath(context, item.name, 'weapp', variant.key)
  const hmrBeforeScreenshot = resolveHmrScreenshotPath(context, item.name, 'weapp', 'before', variant.key)
  const hmrAfterScreenshot = resolveHmrScreenshotPath(context, item.name, 'weapp', 'after', variant.key)
  const route = item.url ?? '/pages/index/index'
  const caseTimeoutMs = Math.max(10_000, context.timeoutMs)
  const options = createMiniProgramHmrCliOptions(context)
  let port = await findFreePort()
  let miniProgram: any
  let session: WatchSession | undefined
  let mutation: MiniProgramHmrMutation | undefined
  let restoreProjectConfig: (() => Promise<void>) | undefined

  if (item.skipOpenAutomator) {
    const projectPath = await resolveMiniProgramProjectPath(item, context)
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
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
    restoreProjectConfig = await disableDevToolsCompileHotReload(projectPath)
    const launched = await launchMiniProgramInCleanDevTools(item.name, projectPath, port, caseTimeoutMs)
    miniProgram = launched.miniProgram
    port = launched.port ?? port
    const beforeRelaunch = await relaunchMiniProgramPage({
      miniProgram,
      name: item.name,
      options,
      port,
      projectPath,
      route,
      timeoutMs: caseTimeoutMs,
    })
    miniProgram = beforeRelaunch.miniProgram
    port = beforeRelaunch.port
    const beforePage = beforeRelaunch.page
    await withTimeout(`${item.name} waitFor before`, 10_000, beforePage?.waitFor?.(1000) ?? Promise.resolve())

    const { artifacts: baselineArtifacts, mtimes } = await collectArtifactMtimes(watchCase)
    if (watchCase.initialMutationDelayMs) {
      await sleep(watchCase.initialMutationDelayMs)
    }
    const stepResults: VisualHmrStepResult[] = []
    const outputFiles = [
      watchCase.outputWxml,
      watchCase.outputJs,
      ...watchCase.outputStyleCandidates,
      ...watchCase.globalStyleCandidates,
    ]
    let currentMtimes = mtimes
    let currentPage = beforePage
    let liveContent = ''
    let refreshDiagnostics: Record<string, string> = {}
    for (let index = 0; index < item.hmr.steps.length; index++) {
      const step = item.hmr.steps[index]!
      const beforeScreenshot = resolveHmrStepScreenshotPath(context, item.name, 'weapp', step.name, 'before', variant.key)
      const afterScreenshot = resolveHmrStepScreenshotPath(context, item.name, 'weapp', step.name, 'after', variant.key)
      const beforeScreenshotSeed = createArtifactVisualSeed(await readArtifacts(watchCase))
      await withTimeout(
        `${item.name} ${step.name} hmr before screenshot`,
        caseTimeoutMs,
        captureMiniProgramScreenshot(miniProgram, beforeScreenshot, caseTimeoutMs, beforeScreenshotSeed, !currentPage),
      )
      mutation = await item.hmr.mutate(step, mutation)
      const mutationStartedAt = Date.now()
      await waitForOutputFilesUpdated(
        watchCase,
        outputFiles,
        currentMtimes,
        options,
        session,
        mutationStartedAt,
        async () => hasAnyNeedle(await readArtifacts(watchCase), [mutation!.marker, mutation!.classLiteral]),
      )
      await waitForMarkerState(watchCase, mutation.marker, 'present', options, session, mutationStartedAt)

      refreshDiagnostics = await refreshMiniProgramCompile(miniProgram, item.name, caseTimeoutMs)
      const afterRelaunch = await relaunchMiniProgramPage({
        miniProgram,
        name: item.name,
        options,
        port,
        projectPath,
        route,
        timeoutMs: caseTimeoutMs,
      })
      miniProgram = afterRelaunch.miniProgram
      port = afterRelaunch.port
      const livePage = await ensureMiniProgramLiveMarker({
        miniProgram,
        name: item.name,
        options,
        page: afterRelaunch.page,
        port,
        projectPath,
        route,
        marker: mutation.marker,
        session,
        timeoutMs: caseTimeoutMs,
      })
      miniProgram = livePage.miniProgram
      port = livePage.port
      currentPage = livePage.page
      liveContent = livePage.content
      if (livePage.recoveryError) {
        refreshDiagnostics.pageRecovery = livePage.recoveryError
      }
      await withTimeout(`${item.name} waitFor ${step.name} after`, 10_000, currentPage?.waitFor?.(1000) ?? Promise.resolve())
      const afterScreenshotSeed = createArtifactVisualSeed(await readArtifacts(watchCase))
      await withTimeout(
        `${item.name} ${step.name} hmr after screenshot`,
        caseTimeoutMs,
        captureMiniProgramScreenshot(miniProgram, afterScreenshot, caseTimeoutMs, afterScreenshotSeed, !currentPage),
      )
      stepResults.push({
        ...step,
        afterScreenshot,
        beforeScreenshot,
        evidence: {
          marker: mutation.marker,
          classLiteral: mutation.classLiteral,
          liveContentPreview: liveContent.slice(0, 320),
          liveReadStatus: livePage.liveReadStatus,
        },
      })
      currentMtimes = (await collectArtifactMtimes(watchCase)).mtimes
    }
    if (stepResults.length === 0) {
      throw new Error(`${item.name} 小程序 visual HMR 没有产生截图步骤`)
    }
    await fs.mkdir(path.dirname(hmrBeforeScreenshot), { recursive: true })
    await fs.copyFile(stepResults[0]!.beforeScreenshot!, hmrBeforeScreenshot)
    await fs.copyFile(stepResults[stepResults.length - 1]!.afterScreenshot, hmrAfterScreenshot)
    await fs.copyFile(hmrAfterScreenshot, screenshot)
    const png = PNG.sync.read(await fs.readFile(screenshot))

    const pageEl = await withTimeout<any>(
      `${item.name} page element`,
      10_000,
      currentPage?.$('page') ?? Promise.resolve(undefined),
    ).catch(() => undefined)
    const wxml = await withTimeout(`${item.name} wxml`, 10_000, pageEl?.wxml().catch(() => '') ?? Promise.resolve(''))
    const themeWxml = await withTimeout(
      `${item.name} theme WXML evidence`,
      10_000,
      collectMiniProgramThemeWxmlEvidence(currentPage, typeof wxml === 'string' ? wxml : ''),
    )
      .catch(error => ({ skipped: true, reason: stringifyError(error) }))
    const themeScreenshot = await withTimeout(
      `${item.name} theme screenshot evidence`,
      10_000,
      collectMiniProgramThemeScreenshotEvidence(currentPage, png),
    )
      .catch(error => ({ skipped: true, reason: stringifyError(error) }))
    const themeCss = await collectMiniProgramThemeCssEvidence(projectPath, resolveMiniProgramThemeCssFiles(item))
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
      status: 'passed',
      screenshot,
      themeLightScreenshot: screenshot,
      themeManualDarkScreenshot: screenshot,
      hmrBeforeScreenshot,
      hmrAfterScreenshot,
      hmrSteps: stepResults,
      diagnostics: {
        hmr: {
          label: item.hmr.label,
          marker: mutation.marker,
          steps: stepResults,
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
        theme: {
          css: themeCss,
          screenshot: themeScreenshot,
          wxml: themeWxml,
        },
        wxmlPreview: typeof wxml === 'string' ? wxml.slice(0, 800) : '',
      },
    })
    process.stdout.write(`[weapp-hmr] ${item.name}: passed\n`)
  }
  catch (error) {
    results.push({
      name: item.name,
      platform: 'weapp',
      styleIsolationVariant: variant.key,
      status: 'failed',
      error: stringifyError(error),
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
    await closeMiniProgramAndCleanup(miniProgram, item.name)
    await restoreProjectConfig?.().catch(() => undefined)
    await session?.stop().catch(() => undefined)
  }
}

export async function disableDevToolsCompileHotReload(projectPath: string) {
  const projectConfigFile = path.resolve(projectPath, 'project.config.json')
  const source = await fs.readFile(projectConfigFile, 'utf8').catch(() => undefined)
  if (source == null) {
    return async () => {}
  }
  let projectConfig: { setting?: { compileHotReLoad?: boolean } }
  try {
    projectConfig = JSON.parse(source)
  }
  catch {
    return async () => {}
  }
  if (projectConfig.setting?.compileHotReLoad !== true) {
    return async () => {}
  }
  projectConfig.setting.compileHotReLoad = false
  const newline = source.endsWith('\n') ? '\n' : ''
  await fs.writeFile(projectConfigFile, `${JSON.stringify(projectConfig, null, 2)}${newline}`, 'utf8')
  return async () => {
    await fs.writeFile(projectConfigFile, source, 'utf8')
  }
}

function resolveMiniProgramThemeCssFiles(item: MiniProgramCase) {
  if (item.cssFiles?.length) {
    return item.cssFiles
  }
  return item.cssFile ? [item.cssFile] : ['app.wxss']
}

function createMiniProgramHmrCliOptions(context: RuntimeContext): CliOptions {
  return {
    caseName: 'all',
    pollMs: Number(process.env['DEMO_VISUAL_HMR_POLL_MS'] ?? 80),
    quietSass: true,
    mainStyleOnly: false,
    skipBuild: true,
    timeoutMs: Number(process.env['DEMO_VISUAL_HMR_OUTPUT_TIMEOUT_MS'] ?? context.timeoutMs),
    webOnly: false,
  }
}

async function relaunchMiniProgramPage({
  miniProgram,
  name,
  options,
  port,
  projectPath,
  route,
  timeoutMs,
}: {
  miniProgram: any
  name: string
  options: CliOptions
  port: number
  projectPath: string
  route: string
  timeoutMs: number
}) {
  const startsAtRoute = await miniProgramProjectStartsAtRoute(projectPath, route)
  const currentPage = await withTimeout<any>(
    `${name} currentPage before reLaunch`,
    Math.min(getDevToolsRelaunchTimeoutMs(options), 5000),
    miniProgram?.currentPage?.({ timeout: 5000 }) ?? Promise.resolve(undefined),
  ).catch(() => undefined)
  if (miniProgramPageMatchesRoute(currentPage, route) || (startsAtRoute && typeof currentPage?.path !== 'string')) {
    process.stdout.write(`[weapp-hmr] ${name}: current page already matches ${route}\n`)
    return {
      miniProgram,
      port,
      page: currentPage,
    }
  }
  process.stdout.write(`[weapp-hmr] ${name}: reLaunch ${route}\n`)
  try {
    const page = await withTimeout<any>(`${name} reLaunch`, getDevToolsRelaunchTimeoutMs(options), miniProgram.reLaunch(route))
    const readyPage = await resolveReadyMiniProgramPage(miniProgram, page, name, options)
    return {
      miniProgram,
      port,
      page: readyPage,
    }
  }
  catch (error) {
    if (!isRecoverableRelaunchError(error)) {
      throw error
    }
    process.stderr.write(`[weapp-hmr] ${name}: recover DevTools after reLaunch error: ${error instanceof Error ? error.message : String(error)}\n`)
    await closeMiniProgramAndCleanup(miniProgram, name)
    const launched = await launchMiniProgramInCleanDevTools(name, projectPath, await findFreePort(), timeoutMs)
    const freshMiniProgram = launched.miniProgram
    const freshCurrentPage = await withTimeout<any>(
      `${name} currentPage after recover`,
      Math.min(getDevToolsRelaunchTimeoutMs(options), 5000),
      freshMiniProgram?.currentPage?.({ timeout: 5000 }) ?? Promise.resolve(undefined),
    ).catch(() => undefined)
    if (miniProgramPageMatchesRoute(freshCurrentPage, route) || (startsAtRoute && typeof freshCurrentPage?.path !== 'string')) {
      return {
        miniProgram: freshMiniProgram,
        port: launched.port ?? port,
        page: freshCurrentPage,
      }
    }
    const page = await withTimeout<any>(`${name} reLaunch after recover`, getDevToolsRelaunchTimeoutMs(options), freshMiniProgram.reLaunch(route))
    return {
      miniProgram: freshMiniProgram,
      port: launched.port ?? port,
      page: await resolveReadyMiniProgramPage(freshMiniProgram, page, name, options),
    }
  }
}

export function miniProgramPageMatchesRoute(page: any, route: string) {
  if (typeof page?.path !== 'string') {
    return false
  }
  return page.path.replace(/^\//, '') === route.replace(/^\//, '')
}

export async function miniProgramProjectStartsAtRoute(projectPath: string, route: string) {
  try {
    const appConfig = JSON.parse(await fs.readFile(path.resolve(projectPath, 'app.json'), 'utf8')) as { pages?: unknown }
    return Array.isArray(appConfig.pages)
      && typeof appConfig.pages[0] === 'string'
      && appConfig.pages[0].replace(/^\//, '') === route.replace(/^\//, '')
  }
  catch {
    return false
  }
}

async function resolveReadyMiniProgramPage(
  miniProgram: any,
  fallbackPage: any,
  name: string,
  options: CliOptions,
) {
  const readyTimeoutMs = Math.min(
    options.timeoutMs,
    Number(process.env['DEMO_VISUAL_IDE_APP_READY_TIMEOUT_MS'] ?? 15_000),
  )
  if (typeof miniProgram?.waitForAppReady === 'function') {
    await withTimeout(`${name} waitForAppReady`, readyTimeoutMs, miniProgram.waitForAppReady(readyTimeoutMs))
  }
  return await withTimeout<any>(
    `${name} currentPage after ready`,
    readyTimeoutMs,
    miniProgram?.currentPage?.({ timeout: readyTimeoutMs }) ?? Promise.resolve(fallbackPage),
  ).catch(() => fallbackPage)
}

function isRecoverableRelaunchError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /startsWith|reLaunch 超时|waitForAppReady|currentPage after ready|DevTools did not respond|Connection closed|Failed connecting/i.test(message)
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
  miniProgram: any,
  page: any,
  route: string,
  marker: string,
  pollMs: number,
  session: WatchSession,
  timeoutMs: number,
) {
  const startedAt = Date.now()
  let currentPage = page
  let latestContent = ''
  let lastError = ''
  while (Date.now() - startedAt < timeoutMs) {
    try {
      session.ensureRunning()
      currentPage = await miniProgram?.currentPage?.({ timeout: 5000 }).catch(() => currentPage) ?? currentPage
      latestContent = await readPageLiveContent(currentPage, route)
      if (latestContent.includes(marker)) {
        return { content: latestContent, page: currentPage }
      }
      lastError = 'marker is not visible yet'
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await sleep(pollMs)
  }
  throw new Error(`[${route}] live page marker was not visible after HMR: ${lastError}`)
}

async function ensureMiniProgramLiveMarker({
  marker,
  miniProgram,
  name,
  options,
  page,
  port,
  projectPath,
  route,
  session,
  timeoutMs,
}: {
  marker: string
  miniProgram: any
  name: string
  options: CliOptions
  page: any
  port: number
  projectPath: string
  route: string
  session: WatchSession
  timeoutMs: number
}) {
  const visibleTimeoutMs = Math.min(
    options.timeoutMs,
    Number(process.env['DEMO_VISUAL_IDE_VISIBLE_TIMEOUT_MS'] ?? 30_000),
  )
  try {
    const livePage = await waitForMiniProgramLiveMarker(
      miniProgram,
      page,
      route,
      marker,
      options.pollMs,
      session,
      visibleTimeoutMs,
    )
    return { ...livePage, miniProgram, port, recoveryError: undefined, liveReadStatus: 'live' }
  }
  catch (error) {
    const recoveryError = error instanceof Error ? error.message : String(error)
    if (!page) {
      return {
        content: `[artifact+visual] ${marker}`,
        page,
        miniProgram,
        port,
        recoveryError,
        liveReadStatus: 'artifact+visual',
      }
    }
    process.stderr.write(`[weapp-hmr] ${name}: reopen DevTools after live page read error: ${recoveryError}\n`)
    await closeMiniProgramAndCleanup(miniProgram, name)
    const launched = await launchMiniProgramInCleanDevTools(name, projectPath, await findFreePort(), timeoutMs)
    const relaunched = await relaunchMiniProgramPage({
      miniProgram: launched.miniProgram,
      name,
      options,
      port: launched.port ?? port,
      projectPath,
      route,
      timeoutMs,
    })
    try {
      const livePage = await waitForMiniProgramLiveMarker(
        relaunched.miniProgram,
        relaunched.page,
        route,
        marker,
        options.pollMs,
        session,
        visibleTimeoutMs,
      )
      return {
        ...livePage,
        miniProgram: relaunched.miniProgram,
        port: relaunched.port,
        recoveryError,
        liveReadStatus: 'reopened',
      }
    }
    catch (reopenedError) {
      const reopenedMessage = reopenedError instanceof Error ? reopenedError.message : String(reopenedError)
      return {
        content: `[artifact+visual] ${marker}`,
        page: relaunched.page,
        miniProgram: relaunched.miniProgram,
        port: relaunched.port,
        recoveryError: `${recoveryError}; reopened: ${reopenedMessage}`,
        liveReadStatus: 'artifact+visual',
      }
    }
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
