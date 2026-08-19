import type { ChildProcess } from 'node:child_process'
import type { AppCase } from '../../e2e/hbuilderx-local/cases.ts'
import type { HBuilderXRunner } from '../../packages/hbuilderx-runner/src/types.ts'
import type { StyleIsolationVariant } from './style-isolation.ts'
import type { CaseResult, RuntimeContext, VisualHmrStepResult } from './types.ts'
import { spawnSync } from 'node:child_process'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { PNG } from 'pngjs'
import {
  analyzeScreenshotColorPresence,
  captureAndroidScreenshot,
  isAndroidDebugShell,
  parseHexColorFromClass,
  readAndroidUiHierarchy,
  resolveAdbCommand,
} from '../../e2e/hbuilderx-local/android-runtime.ts'
import { resolveAppHmrSteps } from '../../e2e/hbuilderx-local/cases.ts'
import {
  assertAndroidToolchain,
  assertHarmonyToolchain,
  assertIosSimulatorToolchain,
  collectProcessOutput,
  createLocalHBuilderXRunner,
  fileExists,
  hbuilderxAppTimeoutMs,
  killProcessTree,
  pollIntervalMs,
  readUtf8,
  resolveHdcCommand,
  wait,
} from '../../e2e/hbuilderx-local/process.ts'
import { createHBuilderXProjectAlias } from '../hbuilderx-project-alias.mjs'
import { finalizeHarmonyAppOutput } from './harmony-output.ts'
import { resolveHmrScreenshotPath, resolveHmrStepScreenshotPath, resolveScreenshotPath } from './screenshots.ts'
import {
  readManifest,
  resolveStyleIsolationVariants,

  writeManifest,
  writeStyleIsolationVariantManifest,
} from './style-isolation.ts'

const appMarkerRE = /\n[ \t]*<view class="[^"]+">(?:<text class="[^"]+">)?hbuilderx-app-(?:dynamic|hmr)-[^<]+(?:<\/text>)?<\/view>/g
const appReadyTimeoutMs = Number(process.env['DEMO_VISUAL_APP_READY_TIMEOUT_MS'] ?? 120_000)
const appOutputTimeoutMs = Number(process.env['DEMO_VISUAL_APP_OUTPUT_TIMEOUT_MS'] ?? Math.min(hbuilderxAppTimeoutMs, 180_000))
const harmonyScreenshotTimeoutMs = Number(process.env['DEMO_VISUAL_HARMONY_SCREENSHOT_TIMEOUT_MS'] ?? 30_000)
const iosScreenshotTimeoutMs = Number(process.env['DEMO_VISUAL_IOS_SCREENSHOT_TIMEOUT_MS'] ?? 30_000)

function resolveAppDemoName(item: AppCase) {
  return path.basename(path.resolve(item.projectDir))
}

function resolveAppMarkerAnchors(item: AppCase) {
  return item.markerAnchorCandidates?.length ? item.markerAnchorCandidates : [item.markerAnchor]
}

function resolveLaunchArg(item: AppCase, name: string) {
  const index = item.launchArgs?.indexOf(name) ?? -1
  return index >= 0 ? item.launchArgs?.[index + 1] : undefined
}

function resolveAppOutputDirCandidates(item: AppCase) {
  return item.outputDirCandidates?.length ? item.outputDirCandidates : [item.outputDir]
}

function resolveAppIntermediateOutputTargets(item: AppCase, projectRoot: string) {
  const targets = new Set<string>()
  if (item.platform === 'app-android' || item.platform === 'app-ios' || item.platform === 'app-harmony') {
    targets.add(path.resolve(projectRoot, '.debug'))
    targets.add(path.resolve(projectRoot, `unpackage/dist/dev/.tsc/${item.platform}`))
    targets.add(path.resolve(projectRoot, `unpackage/dist/dev/.uvue/${item.platform}`))
    targets.add(path.resolve(projectRoot, `unpackage/cache/.${item.platform}`))
  }
  return [...targets]
}

function resolveAppTransformedFiles(projectRoot: string, outputRoot: string, item: AppCase) {
  return [
    ...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)),
    ...(item.transformedOutputFiles ?? []).map(file => path.resolve(outputRoot, file)),
  ]
}

function resolveAppStyleOutputFiles(outputRoot: string, item: AppCase) {
  return (item.styleOutputFiles ?? []).map(file => path.resolve(outputRoot, file))
}

async function findMissingAppFiles(item: AppCase, outputRoot: string) {
  const missing: string[] = []
  for (const file of item.requiredFiles) {
    if (!(await fileExists(path.resolve(outputRoot, file)))) {
      missing.push(file)
    }
  }
  return missing
}

async function readExistingAppTransformedOutput(projectRoot: string, outputRoot: string, item: AppCase) {
  const transformedFiles = resolveAppTransformedFiles(projectRoot, outputRoot, item)
  if (!(await Promise.all(transformedFiles.map(fileExists))).every(Boolean)) {
    return undefined
  }
  return (await Promise.all(transformedFiles.map(readUtf8))).join('\n')
}

async function readExistingAppStyleOutput(outputRoot: string, item: AppCase) {
  const styleFiles = resolveAppStyleOutputFiles(outputRoot, item)
  if (styleFiles.length === 0) {
    return ''
  }
  if (!(await Promise.all(styleFiles.map(fileExists))).every(Boolean)) {
    return undefined
  }
  return (await Promise.all(styleFiles.map(readUtf8))).join('\n')
}

function hasContent(source: string, entries: Array<string | RegExp>) {
  return entries.every((entry) => {
    if (typeof entry === 'string') {
      return source.includes(entry)
    }
    return entry.test(source)
  })
}

function hasNoContent(source: string, entries: Array<string | RegExp> | undefined) {
  return (entries ?? []).every((entry) => {
    if (typeof entry === 'string') {
      return !source.includes(entry)
    }
    return !entry.test(source)
  })
}

async function findReadyAppOutputRoot(item: AppCase, projectRoot: string, expected: Array<string | RegExp>, styleExpected?: Array<string | RegExp>) {
  for (const outputDir of resolveAppOutputDirCandidates(item)) {
    const outputRoot = path.resolve(projectRoot, outputDir)
    const missing = await findMissingAppFiles(item, outputRoot)
    if (missing.length > 0) {
      continue
    }
    if (item.platform === 'app-harmony') {
      await finalizeHarmonyAppOutput(projectRoot, outputRoot)
    }
    const transformed = await readExistingAppTransformedOutput(projectRoot, outputRoot, item)
    const style = styleExpected?.length ? await readExistingAppStyleOutput(outputRoot, item) : ''
    if (
      transformed
      && hasContent(transformed, expected)
      && (styleExpected?.length ? style != null && hasContent(style, styleExpected) : true)
    ) {
      return outputRoot
    }
  }
  return undefined
}

async function waitForAppOutputRoot(
  item: AppCase,
  projectRoot: string,
  expected: Array<string | RegExp>,
  timeoutMs: number,
  ensureRunning: () => void,
  styleExpected?: Array<string | RegExp>,
  forbidden?: Array<string | RegExp>,
) {
  const startedAt = Date.now()
  let latest = ''
  let latestStyle = ''
  while (Date.now() - startedAt < timeoutMs) {
    ensureRunning()
    for (const outputDir of resolveAppOutputDirCandidates(item)) {
      const outputRoot = path.resolve(projectRoot, outputDir)
      const missing = await findMissingAppFiles(item, outputRoot)
      if (missing.length > 0) {
        continue
      }
      if (item.platform === 'app-harmony') {
        await finalizeHarmonyAppOutput(projectRoot, outputRoot)
      }
      const transformed = await readExistingAppTransformedOutput(projectRoot, outputRoot, item)
      if (!transformed) {
        continue
      }
      latest = transformed
      if (!hasContent(transformed, expected)) {
        continue
      }
      if (!hasNoContent(transformed, forbidden)) {
        continue
      }
      if (styleExpected?.length) {
        const style = await readExistingAppStyleOutput(outputRoot, item)
        if (style == null) {
          continue
        }
        latestStyle = style
        if (!hasContent(style, styleExpected)) {
          continue
        }
      }
      return outputRoot
    }
    await wait(pollIntervalMs)
  }
  throw new Error(`${item.name} App 产物未包含预期内容\nexpected=${expected.map(String).join(' | ')}\nforbidden=${forbidden?.map(String).join(' | ') ?? ''}\nstyleExpected=${styleExpected?.map(String).join(' | ') ?? ''}\nlatest=${latest.slice(0, 2000)}\nlatestStyle=${latestStyle.slice(0, 2000)}`)
}

async function cleanAppOutput(item: AppCase, projectRoot: string) {
  const targets = [
    ...resolveAppOutputDirCandidates(item).map(outputDir => path.resolve(projectRoot, outputDir)),
    ...resolveAppIntermediateOutputTargets(item, projectRoot),
    ...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)),
  ]
  await Promise.all([...new Set(targets)].map(async (target) => {
    await rmWithRetry(target)
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
      await wait(500)
    }
  }
}

async function writeAppMarker(
  file: string,
  anchors: string[],
  marker: {
    className: string
    textClassName?: string
    text: string
  },
) {
  const source = await readUtf8(file)
  const cleaned = source.replace(appMarkerRE, '')
  const anchor = anchors.find(item => cleaned.includes(item))
  const index = anchor ? cleaned.indexOf(anchor) : -1
  if (index < 0) {
    throw new Error(`找不到 App visual 插入锚点：${file}`)
  }
  const content = marker.textClassName
    ? `<text class="${marker.textClassName}">${marker.text}</text>`
    : marker.text
  const next = `${cleaned.slice(0, index)}<view class="${marker.className}">${content}</view>\n\t\t${cleaned.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
}

function cleanupAndroidAppRuntime(env: Record<string, string | undefined>, deviceId?: string) {
  const adb = resolveAdbCommand(env)
  spawnSync(adb, [...createAndroidAdbArgs(deviceId), 'reverse', '--remove-all'], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
}

function createAndroidAdbArgs(deviceId?: string) {
  return [
    ...(deviceId ? ['-s', deviceId] : []),
  ]
}

function resolveIosScreenshotTarget(item: AppCase) {
  const launchArgs = item.launchArgs ?? []
  const index = launchArgs.indexOf('--iosTarget')
  const target = process.env['E2E_HBUILDERX_IOS_SCREENSHOT_TARGET']
    ?? (index >= 0 ? launchArgs[index + 1] : undefined)
    ?? process.env['E2E_HBUILDERX_IOS_TARGET']
    ?? 'booted'
  return target === 'simulator' ? 'booted' : target
}

function resolveAndroidScreenshotDeviceId(item: AppCase) {
  const launchArgs = item.launchArgs ?? []
  const index = launchArgs.indexOf('--deviceId')
  return process.env['E2E_HBUILDERX_ANDROID_SCREENSHOT_DEVICE_ID']
    ?? process.env['E2E_HBUILDERX_ANDROID_DEVICE_ID']
    ?? (index >= 0 ? launchArgs[index + 1] : undefined)
}

function resolveHarmonyScreenshotDeviceId(item: AppCase) {
  const launchArgs = item.launchArgs ?? []
  const index = launchArgs.indexOf('--deviceId')
  return process.env['DEMO_VISUAL_HARMONY_SCREENSHOT_DEVICE_ID']
    ?? process.env['DEMO_VISUAL_HARMONY_DEVICE_ID']
    ?? process.env['E2E_HBUILDERX_HARMONY_DEVICE_ID']
    ?? (index >= 0 ? launchArgs[index + 1] : undefined)
}

function createHdcArgs(deviceId?: string) {
  return [
    ...(deviceId ? ['-t', deviceId] : []),
  ]
}

async function captureIosScreenshot(screenshot: string, item: AppCase) {
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  const target = resolveIosScreenshotTarget(item)
  const result = spawnSync('xcrun', ['simctl', 'io', target, 'screenshot', screenshot], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: iosScreenshotTimeoutMs,
  })
  if (result.status !== 0) {
    const timeoutMessage = result.error?.message ? ` error=${result.error.message}` : ''
    throw new Error(`iOS 截图失败：${result.stderr || result.stdout || `exit=${result.status} signal=${result.signal ?? 'none'}${timeoutMessage}`}`)
  }
}

async function captureHarmonyScreenshot(screenshot: string, item: AppCase) {
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  const hdc = resolveHdcCommand()
  const deviceId = resolveHarmonyScreenshotDeviceId(item)
  const baseArgs = createHdcArgs(deviceId)
  const remote = `/data/local/tmp/demo-visual-${process.pid}-${Date.now()}.jpeg`
  const localJpeg = `${screenshot}.jpeg`
  const snapshot = spawnSync(hdc, [...baseArgs, 'shell', 'snapshot_display', '-f', remote], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: harmonyScreenshotTimeoutMs,
  })
  if (snapshot.status !== 0) {
    const timeoutMessage = snapshot.error?.message ? ` error=${snapshot.error.message}` : ''
    throw new Error(`Harmony 截图失败：${snapshot.stderr || snapshot.stdout || `exit=${snapshot.status} signal=${snapshot.signal ?? 'none'}${timeoutMessage}`}`)
  }
  const recv = spawnSync(hdc, [...baseArgs, 'file', 'recv', remote, localJpeg], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: harmonyScreenshotTimeoutMs,
  })
  spawnSync(hdc, [...baseArgs, 'shell', 'rm', '-f', remote], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: harmonyScreenshotTimeoutMs,
  })
  if (recv.status !== 0) {
    const timeoutMessage = recv.error?.message ? ` error=${recv.error.message}` : ''
    throw new Error(`Harmony 截图拉取失败：${recv.stderr || recv.stdout || `exit=${recv.status} signal=${recv.signal ?? 'none'}${timeoutMessage}`}`)
  }
  const convert = spawnSync('sips', ['-s', 'format', 'png', localJpeg, '--out', screenshot], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: harmonyScreenshotTimeoutMs,
  })
  if (convert.status !== 0) {
    const timeoutMessage = convert.error?.message ? ` error=${convert.error.message}` : ''
    throw new Error(`Harmony 截图格式转换失败：${convert.stderr || convert.stdout || `exit=${convert.status} signal=${convert.signal ?? 'none'}${timeoutMessage}`}`)
  }
  await fs.rm(localJpeg, { force: true })
}

async function captureAppScreenshot(item: AppCase, screenshot: string, env: Record<string, string | undefined>) {
  if (item.platform === 'app-android') {
    await captureAndroidScreenshot(screenshot, env, resolveAndroidScreenshotDeviceId(item))
    return
  }
  if (item.platform === 'app-harmony') {
    await captureHarmonyScreenshot(screenshot, item)
    return
  }
  await captureIosScreenshot(screenshot, item)
}

async function analyzeAppScreenshot(screenshot: string) {
  const image = PNG.sync.read(fsSync.readFileSync(screenshot))
  const data = image.data
  let visiblePixels = 0
  let nonWhitePixels = 0
  const totalPixels = image.width * image.height
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 255
    if (alpha < 8) {
      continue
    }
    visiblePixels += 1
    const red = data[index] ?? 255
    const green = data[index + 1] ?? 255
    const blue = data[index + 2] ?? 255
    if (red < 248 || green < 248 || blue < 248) {
      nonWhitePixels += 1
    }
  }
  return {
    height: image.height,
    nonWhitePixels,
    nonWhiteRatio: totalPixels === 0 ? 0 : nonWhitePixels / totalPixels,
    totalPixels,
    visiblePixels,
    width: image.width,
  }
}

export function resolveExpectedMarkerTextColor(markerTextClass?: string) {
  if (!markerTextClass) {
    return undefined
  }
  const arbitraryColor = [...markerTextClass.matchAll(/\btext-\[#([\da-f]{6})\]/gi)].at(-1)?.[1]
  const color = arbitraryColor ?? (markerTextClass.split(/\s+/).includes('text-white') ? 'ffffff' : undefined)
  if (!color) {
    return undefined
  }
  return {
    blue: Number.parseInt(color.slice(4, 6), 16),
    green: Number.parseInt(color.slice(2, 4), 16),
    red: Number.parseInt(color.slice(0, 2), 16),
  }
}

async function analyzeIssue1002MarkerPresentation(
  screenshot: string,
  marker: Awaited<ReturnType<typeof analyzeScreenshotColorPresence>>,
  markerClass: string,
  markerTextClass?: string,
) {
  const image = PNG.sync.read(fsSync.readFileSync(screenshot))
  const bounds = marker.bounds
  if (!bounds) {
    return { ready: false }
  }

  const width = bounds.maxX - bounds.minX + 1
  const height = bounds.maxY - bounds.minY + 1
  const insetX = Math.max(1, Math.floor(width * 0.2))
  const insetY = Math.max(1, Math.floor(height * 0.2))
  const expectedTextColor = resolveExpectedMarkerTextColor(markerTextClass)
  let centerTextColorPixels = 0
  for (let y = bounds.minY + insetY; y <= bounds.maxY - insetY; y++) {
    for (let x = bounds.minX + insetX; x <= bounds.maxX - insetX; x++) {
      const index = (y * image.width + x) * 4
      const red = image.data[index] ?? 0
      const green = image.data[index + 1] ?? 0
      const blue = image.data[index + 2] ?? 0
      if (
        expectedTextColor
        && Math.abs(red - expectedTextColor.red) <= 4
        && Math.abs(green - expectedTextColor.green) <= 4
        && Math.abs(blue - expectedTextColor.blue) <= 4
      ) {
        centerTextColorPixels += 1
      }
    }
  }

  const cornerInset = Math.max(1, Math.floor(Math.min(width, height) * 0.12))
  const cornerPoints = [
    [bounds.minX + cornerInset, bounds.minY + cornerInset],
    [bounds.maxX - cornerInset, bounds.minY + cornerInset],
    [bounds.minX + cornerInset, bounds.maxY - cornerInset],
    [bounds.maxX - cornerInset, bounds.maxY - cornerInset],
  ]
  const background = marker.color
  const coloredCorners = cornerPoints.filter(([x, y]) => {
    const index = (y * image.width + x) * 4
    return Math.abs((image.data[index] ?? 0) - background.red) <= 3
      && Math.abs((image.data[index + 1] ?? 0) - background.green) <= 3
      && Math.abs((image.data[index + 2] ?? 0) - background.blue) <= 3
  }).length
  const roundedReady = !markerClass.includes('rounded-full') || coloredCorners <= 1
  const textColorReady = !expectedTextColor || centerTextColorPixels >= 8

  return {
    centerTextColorPixels,
    coloredCorners,
    expectedTextColor,
    ready: roundedReady && textColorReady,
    roundedReady,
    textColorReady,
  }
}

async function collectAppScreenshotEvidence(
  item: AppCase,
  screenshot: string,
  env: Record<string, string | undefined>,
  expectedMarkerClass?: string,
) {
  const visual = await analyzeAppScreenshot(screenshot)
  const expectedMarkerColor = expectedMarkerClass ? parseHexColorFromClass(expectedMarkerClass) : undefined
  const marker = expectedMarkerColor
    ? await analyzeScreenshotColorPresence(screenshot, expectedMarkerColor)
    : undefined
  const markerPresentation = marker && expectedMarkerClass
    ? await analyzeIssue1002MarkerPresentation(
        screenshot,
        marker,
        expectedMarkerClass,
        expectedMarkerClass === item.markerClass ? item.markerTextClass : item.hmrMarkerTextClass,
      )
    : undefined
  const markerReady = marker ? marker.matched && (markerPresentation?.ready ?? true) : true
  if (item.platform === 'app-android') {
    const deviceId = resolveAndroidScreenshotDeviceId(item)
    const uiHierarchy = await readAndroidUiHierarchy(env, deviceId)
    return {
      marker,
      markerPresentation,
      ready: !isAndroidDebugShell(uiHierarchy) && visual.nonWhiteRatio > 0.01 && markerReady,
      uiTextPreview: uiHierarchy
        .replace(/\s+/g, ' ')
        .slice(0, 800),
      visual,
    }
  }
  if (item.platform === 'app-harmony') {
    return {
      marker,
      markerPresentation,
      ready: visual.nonWhiteRatio > 0.025 && markerReady,
      visual,
    }
  }
  return {
    marker,
    markerPresentation,
    ready: visual.nonWhiteRatio > 0.025 && markerReady,
    visual,
  }
}

async function waitForAppScreenshotReady(
  item: AppCase,
  screenshot: string,
  env: Record<string, string | undefined>,
  label: string,
  ensureRunning: () => void,
  expectedMarkerClass?: string,
) {
  const startedAt = Date.now()
  let latest: Record<string, unknown> | undefined
  while (Date.now() - startedAt < appReadyTimeoutMs) {
    ensureRunning()
    await captureAppScreenshot(item, screenshot, env)
    ensureRunning()
    const evidence = await collectAppScreenshotEvidence(item, screenshot, env, expectedMarkerClass)
    latest = evidence
    if (evidence.ready) {
      return evidence
    }
    await wait(2000)
  }
  throw new Error(`${label} App 截图未进入真实页面\n${JSON.stringify(latest, null, 2)}`)
}

function createProcessExitTracker(child: ChildProcess) {
  let exit: { code: number | null, signal: NodeJS.Signals | null } | undefined
  const startedAt = Date.now()
  const closed = new Promise<void>((resolve) => {
    child.on('close', (code, signal) => {
      exit = { code, signal }
      resolve()
    })
  })
  return {
    closed,
    ensureRunning(logs: string[]) {
      if (exit && exit.code !== 0) {
        throw new Error(`命令失败：HBuilderX app dev exit=${exit.signal ?? exit.code}\n${logs.join('')}`)
      }
      if (!exit && Date.now() - startedAt > hbuilderxAppTimeoutMs) {
        killProcessTree(child)
        throw new Error(`命令超时：HBuilderX app dev timeout=${hbuilderxAppTimeoutMs}ms\n${logs.join('')}`)
      }
    },
  }
}

function startAppLaunch(
  item: AppCase,
  projectRoot: string,
  projectPath: string,
  hbuilderx: HBuilderXRunner,
  toolEnv: Record<string, string | undefined>,
) {
  const launchArgs = [...(item.launchArgs ?? [])]
  if (item.platform !== 'app-harmony' && !launchArgs.includes('--pagePath')) {
    launchArgs.push('--pagePath', 'pages/index/index')
  }
  const child = hbuilderx.spawn({
    args: ['launch', item.platform, '--project', projectPath, ...launchArgs],
    cwd: projectRoot,
    env: {
      WEAPP_TW_HMR_TIMING: '1',
      ...toolEnv,
      ...item.launchEnv,
    },
  }).child
  const logs = collectProcessOutput(child)
  const tracker = createProcessExitTracker(child)
  return { child, logs, tracker }
}

async function stopAppLaunch(launch: ReturnType<typeof startAppLaunch> | undefined) {
  if (!launch) {
    return
  }
  const child = launch.child
  if (child.pid && child.exitCode == null) {
    try {
      if (process.platform === 'win32') {
        child.kill('SIGINT')
      }
      else {
        process.kill(-child.pid, 'SIGINT')
      }
    }
    catch {
      child.kill('SIGINT')
    }
    await Promise.race([launch.tracker.closed, wait(5000)])
  }
  if (child.exitCode == null) {
    killProcessTree(child)
    await Promise.race([launch.tracker.closed, wait(5000)])
  }
}

async function runAppCaseVariant(
  item: AppCase,
  context: RuntimeContext,
  results: CaseResult[],
  variant: StyleIsolationVariant,
  shared?: {
    hbuilderx?: HBuilderXRunner
    originalManifest?: string
    originalSource?: string
    toolEnv?: Record<string, string | undefined>
  },
) {
  const name = resolveAppDemoName(item)
  const platform = item.platform
  const screenshot = resolveScreenshotPath(context, name, platform, variant.key)
  const hmrBeforeScreenshot = resolveHmrScreenshotPath(context, name, platform, 'before', variant.key)
  const hmrAfterScreenshot = resolveHmrScreenshotPath(context, name, platform, 'after', variant.key)
  const projectRoot = path.resolve(context.repoRoot, item.projectDir)
  const sourceFile = path.resolve(projectRoot, item.sourceFile)
  let activeSourceFile = sourceFile
  let launch: ReturnType<typeof startAppLaunch> | undefined
  let projectAlias: Awaited<ReturnType<typeof createHBuilderXProjectAlias>> | undefined
  let beforeScreenshotEvidence: Record<string, unknown> | undefined
  let afterScreenshotEvidence: Record<string, unknown> | undefined

  try {
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: prepare\n`)
    let toolEnv = shared?.toolEnv ?? {}
    if (item.platform === 'app-android') {
      toolEnv = shared?.toolEnv ?? assertAndroidToolchain()
      cleanupAndroidAppRuntime(toolEnv, resolveAndroidScreenshotDeviceId(item))
      await wait(1500)
    }
    else if (item.platform === 'app-ios') {
      assertIosSimulatorToolchain()
    }
    else {
      assertHarmonyToolchain(process.env, resolveLaunchArg(item, '--deviceId'))
    }

    const hbuilderx = shared?.hbuilderx ?? await createLocalHBuilderXRunner(projectRoot, toolEnv)
    projectAlias = await createHBuilderXProjectAlias(projectRoot)
    activeSourceFile = path.resolve(projectAlias.projectPath, item.sourceFile)
    const originalSource = shared?.originalSource ?? (await readUtf8(sourceFile)).replace(appMarkerRE, '')
    const originalManifest = shared?.originalManifest ?? await readManifest(projectRoot).catch(() => undefined)
    const restoreVariantManifest = async () => {
      if (originalManifest === undefined) {
        return
      }
      await writeManifest(projectRoot, originalManifest)
      if (variant.key) {
        await writeStyleIsolationVariantManifest(projectRoot, variant)
      }
    }
    await fs.writeFile(activeSourceFile, originalSource, 'utf8')
    await restoreVariantManifest()

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: write initial marker\n`)
    await writeAppMarker(activeSourceFile, resolveAppMarkerAnchors(item), {
      className: item.markerClass,
      textClassName: item.markerTextClass,
      text: item.markerText,
    })
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: clean output\n`)
    await cleanAppOutput(item, projectRoot)

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: open project ${projectRoot}\n`)
    await hbuilderx.run({
      args: ['project', 'close', '--path', projectAlias.projectPath],
      cwd: projectRoot,
      timeoutMs: hbuilderxAppTimeoutMs,
      allowFailure: true,
      env: toolEnv,
    }).catch(() => undefined)
    await hbuilderx.run({
      args: ['project', 'open', '--path', projectAlias.projectPath],
      cwd: projectRoot,
      timeoutMs: hbuilderxAppTimeoutMs,
      env: toolEnv,
    })

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: launch ${item.platform}\n`)
    launch = startAppLaunch(item, projectRoot, projectAlias.projectPath, hbuilderx, toolEnv)
    const ensureInitialRunning = () => launch?.tracker.ensureRunning(launch.logs)

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: wait initial output\n`)
    const initialExpected = [...item.transformedContains, ...(item.compiledStyleContains ?? [])]
    const initialOutputRoot = await waitForAppOutputRoot(item, projectRoot, initialExpected, appOutputTimeoutMs, ensureInitialRunning, item.styleContains)
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: initial output ${initialOutputRoot}\n`)
    await wait(Number(process.env['DEMO_VISUAL_APP_SCREENSHOT_DELAY_MS'] ?? 3000))
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: screenshot before\n`)
    beforeScreenshotEvidence = await waitForAppScreenshotReady(item, hmrBeforeScreenshot, toolEnv, `${item.name} HMR 前`, ensureInitialRunning, item.markerClass)

    const ensureHmrRunning = ensureInitialRunning
    const hmrSteps: VisualHmrStepResult[] = []
    let previousAfterScreenshot = hmrBeforeScreenshot
    let hmrOutputRoot = initialOutputRoot
    for (const step of resolveAppHmrSteps(item)) {
      const stepBeforeScreenshot = resolveHmrStepScreenshotPath(context, name, platform, step.name, 'before', variant.key)
      const stepAfterScreenshot = resolveHmrStepScreenshotPath(context, name, platform, step.name, 'after', variant.key)
      await fs.mkdir(path.dirname(stepBeforeScreenshot), { recursive: true })
      await fs.copyFile(previousAfterScreenshot, stepBeforeScreenshot)
      process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: write hmr marker ${step.name}\n`)
      await writeAppMarker(activeSourceFile, resolveAppMarkerAnchors(item), {
        className: step.markerClass,
        text: step.markerText,
        ...(step.markerTextClass ? { textClassName: step.markerTextClass } : {}),
      })
      await wait(Number(process.env['DEMO_VISUAL_APP_HMR_MUTATION_DELAY_MS'] ?? 1000))
      process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: wait hmr output ${step.name}\n`)
      const hmrExpected = [...step.transformedContains, ...(item.compiledStyleContains ?? [])]
      hmrOutputRoot = await waitForAppOutputRoot(
        item,
        projectRoot,
        hmrExpected,
        appOutputTimeoutMs,
        ensureHmrRunning,
        step.styleContains,
        [...(item.transformedNotContains ?? []), ...(step.transformedNotContains ?? [])],
      )
      process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: hmr output ${step.name} ${hmrOutputRoot}\n`)
      await wait(Number(process.env['DEMO_VISUAL_APP_SCREENSHOT_DELAY_MS'] ?? 3000))
      process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: screenshot after ${step.name}\n`)
      const evidence = await waitForAppScreenshotReady(item, stepAfterScreenshot, toolEnv, `${item.name} HMR ${step.name} 后`, ensureHmrRunning, step.markerClass)
      const expectedMarkerColor = parseHexColorFromClass(step.markerClass)
      const beforeMarker = expectedMarkerColor
        ? await analyzeScreenshotColorPresence(stepBeforeScreenshot, expectedMarkerColor)
        : undefined
      const markerColorDelta = beforeMarker && evidence.marker
        ? evidence.marker.matchingPixels - beforeMarker.matchingPixels
        : undefined
      if (markerColorDelta != null && markerColorDelta <= 100) {
        throw new Error(`${item.name} HMR ${step.name} 目标背景色像素未明显增加：before=${beforeMarker?.matchingPixels} after=${evidence.marker?.matchingPixels}`)
      }
      hmrSteps.push({
        afterScreenshot: stepAfterScreenshot,
        beforeScreenshot: stepBeforeScreenshot,
        classLiteral: [step.markerClass, step.markerTextClass].filter(Boolean).join(' '),
        evidence: {
          ...evidence,
          markerColorDelta,
        },
        expectedBackgroundColor: step.markerClass.match(/bg-\[(#[0-9a-f]{6})\]/i)?.[1] ?? '',
        marker: step.markerText,
        name: step.name,
      })
      afterScreenshotEvidence = evidence
      previousAfterScreenshot = stepAfterScreenshot
    }
    await fs.copyFile(previousAfterScreenshot, hmrAfterScreenshot)
    await fs.copyFile(hmrAfterScreenshot, screenshot)

    results.push({
      name,
      platform,
      styleIsolationVariant: variant.key,
      status: 'passed',
      screenshot,
      hmrBeforeScreenshot,
      hmrAfterScreenshot,
      hmrSteps,
      diagnostics: {
        hmr: {
          markerText: hmrSteps.at(-1)?.marker,
          steps: hmrSteps,
        },
        initialOutputRoot,
        screenshot: {
          after: afterScreenshotEvidence,
          before: beforeScreenshotEvidence,
        },
        hmrOutputRoot,
        launchArgs: item.launchArgs,
      },
    })
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: passed\n`)

    await stopAppLaunch(launch)
    launch = undefined
  }
  catch (error) {
    const launchLog = launch?.logs.join('').trim()
    results.push({
      name,
      platform,
      styleIsolationVariant: variant.key,
      status: 'failed',
      error: [error instanceof Error ? error.message : String(error), launchLog ? `HBuilderX launch log:\n${launchLog}` : '']
        .filter(Boolean)
        .join('\n'),
      diagnostics: {
        launchArgs: item.launchArgs,
        projectRoot,
      },
    })
  }
  finally {
    await stopAppLaunch(launch)
    if (item.platform === 'app-android') {
      cleanupAndroidAppRuntime(shared?.toolEnv ?? {}, resolveAndroidScreenshotDeviceId(item))
    }
    if (projectAlias) {
      await shared?.hbuilderx?.run({
        args: ['project', 'close', '--path', projectAlias.projectPath],
        cwd: projectRoot,
        timeoutMs: hbuilderxAppTimeoutMs,
        allowFailure: true,
        env: shared?.toolEnv,
      }).catch(() => undefined)
      await projectAlias.cleanup().catch(() => undefined)
    }
    if (shared?.originalSource) {
      await fs.writeFile(sourceFile, shared.originalSource, 'utf8').catch(() => undefined)
    }
    if (shared?.originalManifest) {
      await writeManifest(projectRoot, shared.originalManifest).catch(() => undefined)
    }
    const restoredOutput = await findReadyAppOutputRoot(item, projectRoot, item.transformedContains, item.styleContains).catch(() => undefined)
    if (restoredOutput) {
      process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: restored output ${restoredOutput}\n`)
    }
  }
}

export async function runAppCase(item: AppCase, context: RuntimeContext, results: CaseResult[]) {
  const projectRoot = path.resolve(context.repoRoot, item.projectDir)
  const sourceFile = path.resolve(projectRoot, item.sourceFile)
  const originalSource = (await readUtf8(sourceFile)).replace(appMarkerRE, '')
  const originalManifest = await readManifest(projectRoot).catch(() => undefined)
  const shared = {
    originalManifest,
    originalSource,
    toolEnv: item.platform === 'app-android' ? assertAndroidToolchain() : {},
  }
  const hbuilderx = await createLocalHBuilderXRunner(projectRoot, shared.toolEnv)
  try {
    for (const variant of resolveStyleIsolationVariants(item.projectDir)) {
      await runAppCaseVariant(item, context, results, variant, { ...shared, hbuilderx })
    }
  }
  finally {
    await fs.writeFile(sourceFile, originalSource, 'utf8').catch(() => undefined)
    if (originalManifest !== undefined) {
      await writeManifest(projectRoot, originalManifest).catch(() => undefined)
    }
  }
}
