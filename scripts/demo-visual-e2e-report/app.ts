import type { ChildProcess } from 'node:child_process'
import type { AppCase } from '../../e2e/hbuilderx-local/cases.ts'
import type { StyleIsolationVariant } from './style-isolation.ts'
import type { CaseResult, RuntimeContext } from './types.ts'
import { spawnSync } from 'node:child_process'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { PNG } from 'pngjs'
import {
  assertAndroidToolchain,
  assertHarmonyToolchain,
  assertIosSimulatorToolchain,
  collectProcessOutput,
  fileExists,
  hbuilderxAppTimeoutMs,
  killProcessTree,
  pollIntervalMs,
  readUtf8,
  resolveHBuilderXCli,
  resolveHdcCommand,
  runPnpm,
  spawnPnpm,
  wait,
} from '../../e2e/hbuilderx-local/process.ts'
import { finalizeHarmonyAppOutput } from './harmony-output.ts'
import { resolveHmrScreenshotPath, resolveScreenshotPath } from './screenshots.ts'
import {
  readManifest,
  resolveStyleIsolationVariants,

  writeManifest,
  writeStyleIsolationVariantManifest,
} from './style-isolation.ts'

const appMarkerRE = /\n[ \t]*<view class="[^"]+">hbuilderx-app-(?:dynamic|hmr)-[^<]+<\/view>/g
const appReadyTimeoutMs = Number(process.env['DEMO_VISUAL_APP_READY_TIMEOUT_MS'] ?? 120_000)
const appOutputTimeoutMs = Number(process.env['DEMO_VISUAL_APP_OUTPUT_TIMEOUT_MS'] ?? Math.min(hbuilderxAppTimeoutMs, 180_000))
const androidScreenshotTimeoutMs = Number(process.env['DEMO_VISUAL_ANDROID_SCREENSHOT_TIMEOUT_MS'] ?? 30_000)
const harmonyScreenshotTimeoutMs = Number(process.env['DEMO_VISUAL_HARMONY_SCREENSHOT_TIMEOUT_MS'] ?? 30_000)
const iosScreenshotTimeoutMs = Number(process.env['DEMO_VISUAL_IOS_SCREENSHOT_TIMEOUT_MS'] ?? 30_000)

function resolveAppDemoName(item: AppCase) {
  return path.basename(path.resolve(item.projectDir))
}

function resolveAppMarkerAnchors(item: AppCase) {
  return item.markerAnchorCandidates?.length ? item.markerAnchorCandidates : [item.markerAnchor]
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

function hasContent(source: string, entries: Array<string | RegExp>) {
  return entries.every((entry) => {
    if (typeof entry === 'string') {
      return source.includes(entry)
    }
    return entry.test(source)
  })
}

async function findReadyAppOutputRoot(item: AppCase, projectRoot: string, expected: Array<string | RegExp>) {
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
    if (transformed && hasContent(transformed, expected)) {
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
) {
  const startedAt = Date.now()
  let latest = ''
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
      if (hasContent(transformed, expected)) {
        return outputRoot
      }
    }
    await wait(pollIntervalMs)
  }
  throw new Error(`${item.name} App 产物未包含预期内容\nexpected=${expected.map(String).join(' | ')}\nlatest=${latest.slice(0, 2000)}`)
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
  const next = `${cleaned.slice(0, index)}<view class="${marker.className}">${marker.text}</view>\n\t\t${cleaned.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
}

function resolveAdbCommand(env: Record<string, string | undefined>) {
  const pathEntries = (env.PATH ?? process.env['PATH'] ?? '').split(path.delimiter)
  const candidates = [
    'adb',
    ...pathEntries.map(item => path.resolve(item, process.platform === 'win32' ? 'adb.exe' : 'adb')),
  ]
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['version'], { encoding: 'utf8', env: { ...process.env, ...env } })
    if (result.status === 0) {
      return candidate
    }
  }
  return 'adb'
}

async function captureAndroidScreenshot(screenshot: string, env: Record<string, string | undefined>, deviceId?: string) {
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  const adb = resolveAdbCommand(env)
  const args = [
    ...(deviceId ? ['-s', deviceId] : []),
    'exec-out',
    'screencap',
    '-p',
  ]
  const result = spawnSync(adb, args, {
    encoding: 'buffer',
    env: { ...process.env, ...env },
    killSignal: 'SIGTERM',
    maxBuffer: 20 * 1024 * 1024,
    timeout: androidScreenshotTimeoutMs,
  })
  if (result.status !== 0 || result.stdout.length === 0) {
    const timeoutMessage = result.error?.message ? ` error=${result.error.message}` : ''
    throw new Error(`Android 截图失败：${result.stderr.toString() || `exit=${result.status} signal=${result.signal ?? 'none'}${timeoutMessage}`}`)
  }
  await fs.writeFile(screenshot, result.stdout)
}

function createAndroidAdbArgs(deviceId?: string) {
  return [
    ...(deviceId ? ['-s', deviceId] : []),
  ]
}

async function readAndroidUiHierarchy(env: Record<string, string | undefined>, deviceId?: string) {
  const adb = resolveAdbCommand(env)
  const baseArgs = createAndroidAdbArgs(deviceId)
  spawnSync(adb, [...baseArgs, 'shell', 'uiautomator', 'dump', '/sdcard/window.xml'], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    killSignal: 'SIGTERM',
    timeout: androidScreenshotTimeoutMs,
  })
  const result = spawnSync(adb, [...baseArgs, 'shell', 'cat', '/sdcard/window.xml'], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    killSignal: 'SIGTERM',
    maxBuffer: 1024 * 1024,
    timeout: androidScreenshotTimeoutMs,
  })
  return result.status === 0 ? result.stdout : ''
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

function isAndroidDebugShell(uiHierarchy: string) {
  return /Connect to HBuilderX successfully|io\.dcloud\.uniappx:id\/pull_msg|io\.dcloud\.HBuilder\/io\.dcloud\.PandoraEntryActivity/.test(uiHierarchy)
}

async function collectAppScreenshotEvidence(item: AppCase, screenshot: string, env: Record<string, string | undefined>) {
  const visual = await analyzeAppScreenshot(screenshot)
  if (item.platform === 'app-android') {
    const deviceId = resolveAndroidScreenshotDeviceId(item)
    const uiHierarchy = await readAndroidUiHierarchy(env, deviceId)
    return {
      ready: !isAndroidDebugShell(uiHierarchy) && visual.nonWhiteRatio > 0.01,
      uiTextPreview: uiHierarchy
        .replace(/\s+/g, ' ')
        .slice(0, 800),
      visual,
    }
  }
  if (item.platform === 'app-harmony') {
    return {
      ready: visual.nonWhiteRatio > 0.025,
      visual,
    }
  }
  return {
    ready: visual.nonWhiteRatio > 0.025,
    visual,
  }
}

async function waitForAppScreenshotReady(
  item: AppCase,
  screenshot: string,
  env: Record<string, string | undefined>,
  label: string,
  ensureRunning: () => void,
) {
  const startedAt = Date.now()
  let latest: Record<string, unknown> | undefined
  while (Date.now() - startedAt < appReadyTimeoutMs) {
    ensureRunning()
    await captureAppScreenshot(item, screenshot, env)
    ensureRunning()
    const evidence = await collectAppScreenshotEvidence(item, screenshot, env)
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
  projectName: string,
  hbuilderxCliPath: string,
  toolEnv: Record<string, string | undefined>,
) {
  const launchArgs = [...(item.launchArgs ?? [])]
  if (item.platform !== 'app-harmony' && !launchArgs.includes('--pagePath')) {
    launchArgs.push('--pagePath', 'pages/index/index')
  }
  const launchProject = item.projectDir.includes('uni-app-x-') ? projectRoot : projectName
  const child = spawnPnpm(projectRoot, ['exec', 'hbuilderx', 'launch', item.platform, '--project', launchProject, ...launchArgs], {
    HBUILDERX_CLI_PATH: hbuilderxCliPath,
    WEAPP_TW_HMR_TIMING: '1',
    ...toolEnv,
    ...item.launchEnv,
  })
  const logs = collectProcessOutput(child)
  const tracker = createProcessExitTracker(child)
  return { child, logs, tracker }
}

async function stopAppLaunch(launch: ReturnType<typeof startAppLaunch> | undefined) {
  if (!launch) {
    return
  }
  killProcessTree(launch.child)
  await Promise.race([launch.tracker.closed, wait(5000)])
}

async function runAppCaseVariant(
  item: AppCase,
  context: RuntimeContext,
  results: CaseResult[],
  variant: StyleIsolationVariant,
  shared?: {
    hbuilderxCliPath?: string
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
  const projectName = path.basename(projectRoot)
  const sourceFile = path.resolve(projectRoot, item.sourceFile)
  let launch: ReturnType<typeof startAppLaunch> | undefined
  let beforeScreenshotEvidence: Record<string, unknown> | undefined
  let afterScreenshotEvidence: Record<string, unknown> | undefined

  try {
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: prepare\n`)
    let toolEnv = shared?.toolEnv ?? {}
    if (item.platform === 'app-android') {
      toolEnv = shared?.toolEnv ?? assertAndroidToolchain()
    }
    else if (item.platform === 'app-ios') {
      assertIosSimulatorToolchain()
    }
    else {
      assertHarmonyToolchain()
    }

    const hbuilderxCliPath = shared?.hbuilderxCliPath ?? await resolveHBuilderXCli()
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
    await fs.writeFile(sourceFile, originalSource, 'utf8')
    await restoreVariantManifest()

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: write initial marker\n`)
    await writeAppMarker(sourceFile, resolveAppMarkerAnchors(item), {
      className: item.markerClass,
      text: item.markerText,
    })
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: clean output\n`)
    await cleanAppOutput(item, projectRoot)

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: open project ${projectRoot}\n`)
    await runPnpm(projectRoot, ['exec', 'hbuilderx', 'project', 'open', '--path', projectRoot], hbuilderxAppTimeoutMs, {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
      ...toolEnv,
    })

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: launch ${item.platform}\n`)
    launch = startAppLaunch(item, projectRoot, projectName, hbuilderxCliPath, toolEnv)
    const ensureInitialRunning = () => launch?.tracker.ensureRunning(launch.logs)

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: wait initial output\n`)
    const initialOutputRoot = await waitForAppOutputRoot(item, projectRoot, item.transformedContains, appOutputTimeoutMs, ensureInitialRunning)
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: initial output ${initialOutputRoot}\n`)
    await wait(Number(process.env['DEMO_VISUAL_APP_SCREENSHOT_DELAY_MS'] ?? 3000))
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: screenshot before\n`)
    beforeScreenshotEvidence = await waitForAppScreenshotReady(item, hmrBeforeScreenshot, toolEnv, `${item.name} HMR 前`, ensureInitialRunning)
    await stopAppLaunch(launch)
    launch = undefined

    await fs.writeFile(sourceFile, originalSource, 'utf8')
    await restoreVariantManifest()

    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: write hmr marker\n`)
    await writeAppMarker(sourceFile, resolveAppMarkerAnchors(item), {
      className: item.hmrMarkerClass,
      text: item.hmrMarkerText,
    })
    await wait(Number(process.env['DEMO_VISUAL_APP_HMR_RELAUNCH_DELAY_MS'] ?? 1000))
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: launch hmr ${item.platform}\n`)
    launch = startAppLaunch(item, projectRoot, projectName, hbuilderxCliPath, toolEnv)
    const ensureHmrRunning = () => launch?.tracker.ensureRunning(launch.logs)
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: wait hmr output\n`)
    const hmrOutputRoot = await waitForAppOutputRoot(item, projectRoot, item.hmrTransformedContains, appOutputTimeoutMs, ensureHmrRunning)
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: hmr output ${hmrOutputRoot}\n`)
    await wait(Number(process.env['DEMO_VISUAL_APP_SCREENSHOT_DELAY_MS'] ?? 3000))
    process.stdout.write(`[app-${platform}] ${name}${variant.key ? ` ${variant.key}` : ''}: screenshot after\n`)
    afterScreenshotEvidence = await waitForAppScreenshotReady(item, hmrAfterScreenshot, toolEnv, `${item.name} HMR 后`, ensureHmrRunning)
    await fs.copyFile(hmrAfterScreenshot, screenshot)

    results.push({
      name,
      platform,
      styleIsolationVariant: variant.key,
      status: 'passed',
      screenshot,
      hmrBeforeScreenshot,
      hmrAfterScreenshot,
      diagnostics: {
        hmr: {
          markerText: item.hmrMarkerText,
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
    results.push({
      name,
      platform,
      styleIsolationVariant: variant.key,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      diagnostics: {
        launchArgs: item.launchArgs,
        projectRoot,
      },
    })
  }
  finally {
    await stopAppLaunch(launch)
    if (shared?.originalSource) {
      await fs.writeFile(sourceFile, shared.originalSource, 'utf8').catch(() => undefined)
    }
    if (shared?.originalManifest) {
      await writeManifest(projectRoot, shared.originalManifest).catch(() => undefined)
    }
    const restoredOutput = await findReadyAppOutputRoot(item, projectRoot, item.transformedContains).catch(() => undefined)
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
    hbuilderxCliPath: await resolveHBuilderXCli(),
    originalManifest,
    originalSource,
    toolEnv: item.platform === 'app-android' ? assertAndroidToolchain() : {},
  }
  try {
    for (const variant of resolveStyleIsolationVariants(item.projectDir)) {
      await runAppCaseVariant(item, context, results, variant, shared)
    }
  }
  finally {
    await fs.writeFile(sourceFile, originalSource, 'utf8').catch(() => undefined)
    if (originalManifest !== undefined) {
      await writeManifest(projectRoot, originalManifest).catch(() => undefined)
    }
  }
}
