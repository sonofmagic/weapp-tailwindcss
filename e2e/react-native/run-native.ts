/* eslint-disable antfu/no-top-level-await, perfectionist/sort-imports, style/max-statements-per-line */

import type { Server } from 'node:http'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import os from 'node:os'
import { execa } from 'execa'
import type { ReactNativePlatform, ReactNativeReport } from './catalog'
import { validateReactNativeReport } from './reports'

interface ReportEnvelope { hmrMarker: string, cssHmrColor: string, report: ReactNativeReport }

const platform = process.argv[2] as ReactNativePlatform
if (platform !== 'android' && platform !== 'ios') { throw new Error('Usage: tsx e2e/react-native/run-native.ts <android|ios>') }

const repoRoot = path.resolve(import.meta.dirname, '../..')
const exampleRoot = path.resolve(repoRoot, 'examples/react-native-expo')
const artifacts = path.resolve(repoRoot, `e2e/.artifacts/react-native-${platform}`)
const reportsDir = path.resolve(repoRoot, 'e2e/react-native/reports')
const markerFile = path.resolve(exampleRoot, 'src/hmr-marker.ts')
const cssFile = path.resolve(exampleRoot, 'global.css')
const reports: ReportEnvelope[] = []
const updateBaseline = process.env['RN_UPDATE_BASELINE'] === '1'

function startReporter() {
  let server: Server
  const ready = new Promise<number>((resolve) => {
    server = createServer((request, response) => {
      if (request.method !== 'POST') { response.writeHead(404).end(); return }
      const chunks: Buffer[] = []
      request.on('data', chunk => chunks.push(Buffer.from(chunk)))
      request.on('end', () => {
        try {
          reports.push(JSON.parse(Buffer.concat(chunks).toString('utf8')) as ReportEnvelope)
          response.writeHead(204).end()
        }
        catch (error) {
          response.writeHead(400).end(String(error))
        }
      })
    })
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve(typeof address === 'object' && address ? address.port : 0)
    })
  })
  return { ready, close: () => new Promise<void>(resolve => server.close(() => resolve())) }
}

async function waitForMetro(metro: ReturnType<typeof execa>, timeout = 120_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (typeof metro.exitCode === 'number') { throw new TypeError(`Metro exited with code ${metro.exitCode}; see ${path.resolve(artifacts, 'metro.log')}`) }
    try {
      const response = await fetch('http://127.0.0.1:8081/status')
      if ((await response.text()).includes('packager-status:running')) { return }
    }
    catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('Timed out waiting for Metro on port 8081')
}

async function waitForReportOrExit(marker: string, run: ReturnType<typeof execa>, metro: ReturnType<typeof execa>, timeout = 240_000, cssHmrColor?: string, recover?: () => Promise<void>) {
  const started = Date.now()
  let runCompletedAt: number | undefined
  let recovered = false
  while (Date.now() - started < timeout) {
    const envelope = reports.find(item => item.hmrMarker === marker && (!cssHmrColor || item.cssHmrColor === cssHmrColor))
    if (envelope) { return envelope }
    if (typeof run.exitCode === 'number' && run.exitCode !== 0) { throw new TypeError(`expo run:${platform} exited with code ${run.exitCode}; see ${path.resolve(artifacts, 'expo-run.log')}`) }
    if (run.exitCode === 0 && !runCompletedAt) { runCompletedAt = Date.now() }
    if (recover && runCompletedAt && !recovered && Date.now() - runCompletedAt >= 60_000) {
      await recover()
      recovered = true
    }
    if (typeof metro.exitCode === 'number') { throw new TypeError(`Metro exited with code ${metro.exitCode}; see ${path.resolve(artifacts, 'metro.log')}`) }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for ${platform} runtime report marker=${marker} css=${cssHmrColor ?? 'any'}`)
}

async function fileHash(file: string) {
  return createHash('sha256').update(await fs.readFile(file)).digest('hex')
}

async function waitForRuntimePaint() {
  await new Promise(resolve => setTimeout(resolve, 2_000))
}

async function capture(name: string, device: string) {
  const output = path.resolve(artifacts, name)
  if (platform === 'android') {
    const result = await execa('adb', ['-s', device, 'exec-out', 'screencap', '-p'], { encoding: 'buffer' })
    await fs.writeFile(output, result.stdout)
  }
  else {
    await execa('xcrun', ['simctl', 'io', device, 'screenshot', output])
  }
  const stat = await fs.stat(output)
  if (stat.size < 1024) { throw new Error(`${platform} screenshot is unexpectedly small: ${stat.size}`) }
  return output
}

async function captureFailureDiagnostics(device: string) {
  if (platform === 'android') {
    const logcat = await execa('adb', ['-s', device, 'logcat', '-d', '-v', 'threadtime'], { reject: false })
    await fs.writeFile(path.resolve(artifacts, 'logcat.txt'), logcat.stdout, 'utf8')
    const dumpResult = await execa('adb', ['-s', device, 'shell', 'uiautomator', 'dump', '/sdcard/window.xml'], { reject: false })
    if (dumpResult.exitCode === 0) {
      const window = await execa('adb', ['-s', device, 'exec-out', 'cat', '/sdcard/window.xml'], { reject: false })
      await fs.writeFile(path.resolve(artifacts, 'window-failure.xml'), window.stdout, 'utf8')
    }
  }
  try { await capture('failure.png', device) }
  catch { /* 设备未启动时没有可用截图。 */ }
}

async function relaunchRuntime(device: string) {
  const appId = 'com.weapptailwindcss.rncompat'
  const url = `${appId}://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`
  if (platform === 'android') {
    await execa('adb', ['-s', device, 'shell', 'am', 'force-stop', appId], { reject: false })
    await execa('adb', ['-s', device, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url], { reject: false })
    return
  }
  await execa('xcrun', ['simctl', 'terminate', device, appId], { reject: false })
  await execa('xcrun', ['simctl', 'openurl', device, url])
}

async function assertAndroidMarker(device: string, marker: string) {
  const dump = path.resolve(artifacts, 'window.xml')
  await execa('adb', ['-s', device, 'shell', 'uiautomator', 'dump', '/sdcard/window.xml'])
  const result = await execa('adb', ['-s', device, 'exec-out', 'cat', '/sdcard/window.xml'])
  await fs.writeFile(dump, result.stdout, 'utf8')
  if (!result.stdout.includes(marker) || !result.stdout.includes('tw-rn-root')) { throw new Error(`Android accessibility tree is missing ${marker} or tw-rn-root`) }
}

async function collectNativeEnvironment(device: string): Promise<Partial<ReactNativeReport['environment']>> {
  if (platform === 'android') {
    const [model, abi, release, sdk] = await Promise.all([
      execa('adb', ['-s', device, 'shell', 'getprop', 'ro.product.model']),
      execa('adb', ['-s', device, 'shell', 'getprop', 'ro.product.cpu.abi']),
      execa('adb', ['-s', device, 'shell', 'getprop', 'ro.build.version.release']),
      execa('adb', ['-s', device, 'shell', 'getprop', 'ro.build.version.sdk']),
    ])
    return {
      deviceName: model.stdout.trim(),
      osVersion: `${release.stdout.trim()} (API ${sdk.stdout.trim()})`,
      abi: abi.stdout.trim(),
    }
  }
  const [devices, modelIdentifier, abi] = await Promise.all([
    execa('xcrun', ['simctl', 'list', 'devices', 'available', '-j']),
    execa('xcrun', ['simctl', 'getenv', device, 'SIMULATOR_MODEL_IDENTIFIER'], { reject: false }),
    execa('xcrun', ['simctl', 'spawn', device, '/usr/bin/uname', '-m']),
  ])
  const parsed = JSON.parse(devices.stdout) as { devices: Record<string, Array<{ name: string, udid: string }>> }
  const simulator = Object.values(parsed.devices).flat().find(item => item.udid === device)
  const model = modelIdentifier.stdout.trim()
  return {
    deviceName: `${simulator?.name ?? 'iOS Simulator'}${model ? ` (${model})` : ''}`,
    abi: abi.stdout.trim(),
  }
}

function withNativeEnvironment(report: ReactNativeReport, environment: Partial<ReactNativeReport['environment']>) {
  return { ...report, environment: { ...report.environment, ...environment } }
}

async function main() {
  await fs.rm(artifacts, { recursive: true, force: true })
  await fs.mkdir(artifacts, { recursive: true })
  if (updateBaseline) { await fs.mkdir(reportsDir, { recursive: true }) }
  const originalMarker = await fs.readFile(markerFile, 'utf8')
  const originalCss = await fs.readFile(cssFile, 'utf8')
  const reporter = startReporter()
  const port = await reporter.ready
  const device = platform === 'android'
    ? process.env['RN_ANDROID_DEVICE_ID'] ?? 'emulator-5554'
    : process.env['RN_IOS_DEVICE_ID'] ?? (await execa('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'])).stdout.match(/"udid"\s*:\s*"([^"]+)"/)?.[1] ?? ''
  if (!device) { throw new TypeError(`No booted ${platform} simulator was found`) }
  const nativeEnvironment = await collectNativeEnvironment(device)
  const reportUrl = `http://127.0.0.1:${port}`
  if (platform === 'android') {
    await execa('adb', ['-s', device, 'reverse', `tcp:${port}`, `tcp:${port}`])
    await execa('adb', ['-s', device, 'reverse', 'tcp:8081', 'tcp:8081'])
    await execa('adb', ['-s', device, 'logcat', '-c'], { reject: false })
  }
  const logFile = await fs.open(path.resolve(artifacts, 'expo-run.log'), 'w')
  const metroLogFile = await fs.open(path.resolve(artifacts, 'metro.log'), 'w')
  const javaHome = platform === 'android'
    ? process.env['RN_JAVA_HOME']
    ?? process.env['JAVA_HOME']
    ?? (process.platform === 'darwin' ? '/Applications/Android Studio.app/Contents/jbr/Contents/Home' : undefined)
    : undefined
  const androidHome = process.env['ANDROID_HOME']
    ?? process.env['ANDROID_SDK_ROOT']
    ?? (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Android', 'sdk')
      : path.join(os.homedir(), 'Android', 'Sdk'))
  const env = {
    ...process.env,
    CI: '0',
    EXPO_PUBLIC_RN_REPORT_URL: reportUrl,
    ...(javaHome ? { JAVA_HOME: javaHome } : {}),
    ...(platform === 'android' ? { ANDROID_HOME: androidHome } : {}),
  }
  if (javaHome) { env.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${process.env['PATH'] ?? ''}` }
  const metro = execa('pnpm', ['--filter', '@weapp-tailwindcss/example-react-native-expo', 'exec', 'expo', 'start', '--localhost', '--port', '8081', '--clear'], {
    cwd: repoRoot,
    env,
    stdout: metroLogFile.createWriteStream(),
    stderr: metroLogFile.createWriteStream(),
    reject: false,
  })
  await waitForMetro(metro)
  const runArgs = ['--filter', '@weapp-tailwindcss/example-react-native-expo', 'exec', 'expo', 'run', platform === 'android' ? 'android' : 'ios', '--no-bundler']
  if (platform === 'ios') { runArgs.push('--device', device) }
  const run = execa('pnpm', runArgs, {
    cwd: repoRoot,
    env,
    stdout: logFile.createWriteStream(),
    stderr: logFile.createWriteStream(),
    reject: false,
  })
  let completed = false
  try {
    // 首次原生构建包含 CocoaPods/Gradle 依赖准备，不能使用 HMR 的短超时。
    const baseline = await waitForReportOrExit('rn-hmr-baseline', run, metro, 1_200_000, '#10b981', () => relaunchRuntime(device))
    const baselineReport = withNativeEnvironment(baseline.report, nativeEnvironment)
    validateReactNativeReport(baselineReport, platform)
    await waitForRuntimePaint()
    const beforeScreenshot = await capture('runtime-before.png', device)
    if (platform === 'android') { await assertAndroidMarker(device, 'rn-hmr-baseline') }

    const updated = originalMarker.replace('rn-hmr-baseline', 'rn-hmr-updated').replace('bg-emerald-500', 'bg-rose-500')
    await fs.writeFile(markerFile, updated, 'utf8')
    const hmr = await waitForReportOrExit('rn-hmr-updated', run, metro, 120_000, '#10b981')
    const hmrReport = withNativeEnvironment(hmr.report, nativeEnvironment)
    validateReactNativeReport(hmrReport, platform)
    await waitForRuntimePaint()
    const afterTsxScreenshot = await capture('runtime-tsx-after.png', device)
    if (platform === 'android') { await assertAndroidMarker(device, 'rn-hmr-updated') }
    const updatedCss = originalCss.replace('#10b981', '#f59e0b')
    if (updatedCss === originalCss) { throw new Error('CSS HMR probe color was not found') }
    await fs.writeFile(cssFile, updatedCss, 'utf8')
    const cssHmr = await waitForReportOrExit('rn-hmr-updated', run, metro, 120_000, '#f59e0b')
    const cssHmrReport = withNativeEnvironment(cssHmr.report, nativeEnvironment)
    validateReactNativeReport(cssHmrReport, platform)
    await waitForRuntimePaint()
    const afterScreenshot = await capture('runtime-after.png', device)
    if (platform === 'android') { await assertAndroidMarker(device, 'rn-hmr-updated') }
    const beforeHash = await fileHash(beforeScreenshot)
    const afterTsxHash = await fileHash(afterTsxScreenshot)
    const afterHash = await fileHash(afterScreenshot)
    if (beforeHash === afterTsxHash) { throw new Error(`${platform} TSX HMR screenshot did not change`) }
    if (afterTsxHash === afterHash) { throw new Error(`${platform} CSS HMR screenshot did not change`) }
    await fs.writeFile(path.resolve(artifacts, 'report-before.json'), `${JSON.stringify(baselineReport, null, 2)}\n`, 'utf8')
    await fs.writeFile(path.resolve(artifacts, 'report.json'), `${JSON.stringify(cssHmrReport, null, 2)}\n`, 'utf8')
    await fs.writeFile(path.resolve(artifacts, 'hmr.json'), `${JSON.stringify({
      beforeMarker: baseline.hmrMarker,
      afterTsxMarker: hmr.hmrMarker,
      beforeCssColor: hmr.cssHmrColor,
      afterCssColor: cssHmr.cssHmrColor,
      beforeScreenshotHash: beforeHash,
      afterTsxScreenshotHash: afterTsxHash,
      afterScreenshotHash: afterHash,
    }, null, 2)}\n`, 'utf8')
    if (updateBaseline) {
      await fs.writeFile(path.resolve(reportsDir, `${platform}.json`), `${JSON.stringify(cssHmrReport, null, 2)}\n`, 'utf8')
    }
    completed = true
  }
  finally {
    if (!completed) { await captureFailureDiagnostics(device) }
    await fs.writeFile(markerFile, originalMarker, 'utf8')
    await fs.writeFile(cssFile, originalCss, 'utf8')
    run.kill('SIGTERM')
    await run.catch(() => undefined)
    metro.kill('SIGTERM')
    await metro.catch(() => undefined)
    await logFile.close()
    await metroLogFile.close()
    await reporter.close()
    if (platform === 'android') {
      await execa('adb', ['-s', device, 'reverse', '--remove', `tcp:${port}`], { reject: false })
      await execa('adb', ['-s', device, 'reverse', '--remove', 'tcp:8081'], { reject: false })
    }
  }
}

await main()
