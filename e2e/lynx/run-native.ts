import type { NativePlatformReport, NativeRuntimeEnvironment, Platform } from '../../examples/react-lynx/src/compatibility/types'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { buildCompatibilityBundle } from './build'
import { exampleDir, repoRoot } from './catalog'
import { defaultReportPath, nativeReportConclusion, validateNativeReport } from './reports'

const platformArgument = process.argv[2]
if (platformArgument !== 'android' && platformArgument !== 'ios') {
  throw new Error('Usage: tsx e2e/lynx/run-native.ts <android|ios>')
}
const platform: Platform = platformArgument

const fixtureDir = path.join(repoRoot, 'e2e', 'fixtures', 'lynx-native', platform)
const applicationId = 'com.weapptailwindcss.lynxcompat'

async function command(name: string, args: string[], cwd: string, timeout = 300_000) {
  const result = await execa(name, args, { all: true, cwd, reject: false, timeout })
  if (result.exitCode !== 0) {
    throw new Error(`${name} ${args.join(' ')} failed:\n${result.all}`)
  }
  return result.all ?? ''
}

async function waitForReport(read: () => Promise<string | undefined>) {
  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    const source = await read()
    if (source) {
      return source
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('Timed out waiting for the native compatibility report.')
}

function positiveNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && value > 0 ? value : fallback
}

async function androidEnvironment(source: NativePlatformReport): Promise<NativeRuntimeEnvironment> {
  const getprop = async (name: string) => (await command('adb', ['shell', 'getprop', name], fixtureDir, 30_000)).trim()
  const [deviceName, deviceModel, osVersion, osBuild, apiLevel, abi, displaySize, density] = await Promise.all([
    getprop('ro.product.name'),
    getprop('ro.product.model'),
    getprop('ro.build.version.release'),
    getprop('ro.build.id'),
    getprop('ro.build.version.sdk'),
    getprop('ro.product.cpu.abi'),
    command('adb', ['shell', 'wm', 'size'], fixtureDir, 30_000),
    command('adb', ['shell', 'wm', 'density'], fixtureDir, 30_000),
  ])
  const size = displaySize.match(/(\d+)x(\d+)/)
  const dpi = Number(density.match(/(\d+)/)?.[1])
  return {
    ...source.environment,
    deviceName,
    deviceModel,
    osName: 'Android',
    osVersion,
    osBuild,
    runtimeIdentifier: `android-${apiLevel}`,
    apiLevel: Number(apiLevel),
    abi,
    viewport: {
      width: positiveNumber(source.environment.viewport.width, Number(size?.[1])),
      height: positiveNumber(source.environment.viewport.height, Number(size?.[2])),
      pixelRatio: positiveNumber(source.environment.viewport.pixelRatio, dpi / 160),
    },
  }
}

async function iosEnvironment(source: NativePlatformReport, hostDir: string): Promise<NativeRuntimeEnvironment> {
  const devicesSource = await command('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], hostDir, 30_000)
  const devices = JSON.parse(devicesSource) as { devices: Record<string, Array<{ name: string, udid: string, state: string }>> }
  const entry = Object.entries(devices.devices).flatMap(([runtime, items]) => items.map(item => ({ runtime, ...item }))).find(item => item.state === 'Booted')
  if (!entry) {
    throw new Error('Cannot resolve the booted iOS simulator environment.')
  }
  const getenv = async (name: string) => (await command('xcrun', ['simctl', 'getenv', entry.udid, name], hostDir, 30_000)).trim()
  const [deviceModel, osVersion, osBuild, screenWidth, screenHeight, screenScale] = await Promise.all([
    getenv('SIMULATOR_MODEL_IDENTIFIER'),
    getenv('SIMULATOR_RUNTIME_VERSION'),
    getenv('SIMULATOR_RUNTIME_BUILD_VERSION'),
    getenv('SIMULATOR_MAINSCREEN_WIDTH'),
    getenv('SIMULATOR_MAINSCREEN_HEIGHT'),
    getenv('SIMULATOR_MAINSCREEN_SCALE'),
  ])
  const scale = Number(screenScale)
  return {
    ...source.environment,
    deviceName: entry.name,
    deviceModel,
    osName: 'iOS',
    osVersion,
    osBuild,
    runtimeIdentifier: entry.runtime,
    abi: process.arch === 'arm64' ? 'arm64' : 'x86_64',
    viewport: {
      width: positiveNumber(source.environment.viewport.width, Number(screenWidth) / scale),
      height: positiveNumber(source.environment.viewport.height, Number(screenHeight) / scale),
      pixelRatio: positiveNumber(source.environment.viewport.pixelRatio, scale),
    },
  }
}

async function enrichEnvironment(report: NativePlatformReport, hostDir: string) {
  report.environment = platform === 'android'
    ? await androidEnvironment(report)
    : await iosEnvironment(report, hostDir)
  return report
}

async function collectAndroidArtifacts(artifactDir: string) {
  const directory = 'files/lynx-compat/artifacts'
  const listing = await execa('adb', ['shell', 'run-as', applicationId, 'ls', directory], { reject: false })
  if (listing.exitCode !== 0) {
    return
  }
  const outputDir = path.join(artifactDir, 'crops')
  await fs.mkdir(outputDir, { recursive: true })
  for (const name of listing.stdout.split(/\r?\n/).filter(name => /^[a-z0-9-]+\.png$/.test(name))) {
    const result = await execa('adb', ['exec-out', 'run-as', applicationId, 'cat', `${directory}/${name}`], { encoding: 'buffer', reject: false })
    if (result.exitCode === 0 && result.stdout) {
      await fs.writeFile(path.join(outputDir, name), result.stdout)
    }
  }
}

async function collectAndroidLogcat(artifactDir: string) {
  const result = await execa('adb', ['logcat', '-d', '-t', '2500'], { encoding: 'utf8', reject: false })
  if (result.stdout) {
    await fs.writeFile(path.join(artifactDir, 'logcat.txt'), result.stdout)
  }
}

async function collectIosArtifacts(container: string, artifactDir: string) {
  const source = path.join(container, 'Library', 'Application Support', 'lynx-compat', 'artifacts')
  await fs.cp(source, path.join(artifactDir, 'crops'), { recursive: true }).catch(() => undefined)
}

async function installedAndroidCompileSdk() {
  const sdkRoot = process.env['ANDROID_SDK_ROOT'] ?? process.env['ANDROID_HOME']
  if (!sdkRoot) {
    return undefined
  }
  const entries = await fs.readdir(path.join(sdkRoot, 'platforms'), { withFileTypes: true }).catch(() => [])
  const versions = entries
    .filter(entry => entry.isDirectory())
    .map(entry => /^android-(\d+)$/.exec(entry.name)?.[1])
    .filter((value): value is string => value !== undefined)
    .map(Number)
  return versions.length > 0 ? Math.max(...versions) : undefined
}

async function bootedIosDeviceId(hostDir: string) {
  const source = await command('xcrun', ['simctl', 'list', 'devices', 'booted', '--json'], hostDir, 30_000)
  const devices = JSON.parse(source) as { devices: Record<string, Array<{ udid: string, state: string }>> }
  const device = Object.values(devices.devices).flat().find(item => item.state === 'Booted')
  if (!device) {
    throw new Error('No booted iOS simulator is available.')
  }
  return device.udid
}

async function runAndroid(hostDir: string, artifactDir: string) {
  await command('adb', ['get-state'], hostDir, 30_000)
  const compileSdk = await installedAndroidCompileSdk()
  const gradleArguments = ['--project-dir', hostDir, ':app:assembleDebug', '--stacktrace']
  if (compileSdk) {
    gradleArguments.push(`-PlynxCompileSdk=${compileSdk}`)
  }
  await command('gradle', gradleArguments, hostDir)
  const apkPath = path.join(hostDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
  await command('adb', ['install', '-r', apkPath], hostDir, 120_000)
  await command('adb', ['shell', 'am', 'force-stop', applicationId], hostDir, 30_000)
  await execa('adb', ['shell', 'run-as', applicationId, 'rm', '-f', 'files/lynx-compat/report.json'], { reject: false })
  const hiddenErrorDialogs = (await command('adb', ['shell', 'settings', 'get', 'global', 'hide_error_dialogs'], hostDir, 30_000)).trim()
  await command('adb', ['shell', 'settings', 'put', 'global', 'hide_error_dialogs', '1'], hostDir, 30_000)
  try {
    await execa('adb', ['shell', 'input', 'keyevent', 'KEYCODE_WAKEUP'], { reject: false })
    await execa('adb', ['shell', 'wm', 'dismiss-keyguard'], { reject: false })
    await execa('adb', ['shell', 'am', 'broadcast', '-a', 'android.intent.action.CLOSE_SYSTEM_DIALOGS'], { reject: false })
    await execa('adb', ['shell', 'input', 'keyevent', 'KEYCODE_BACK'], { reject: false })
    await command('adb', ['shell', 'am', 'start', '-W', '-n', `${applicationId}/.MainActivity`], hostDir, 60_000)
    const report = await waitForReport(async () => {
      const result = await execa('adb', ['shell', 'run-as', applicationId, 'cat', 'files/lynx-compat/report.json'], { reject: false })
      return result.exitCode === 0 && result.stdout.trim().startsWith('{') ? result.stdout : undefined
    })
    const screenshotPath = path.join(artifactDir, 'screen.png')
    const screenshot = await execa('adb', ['exec-out', 'screencap', '-p'], { encoding: 'buffer', reject: false })
    if (screenshot.exitCode === 0 && screenshot.stdout) {
      await fs.writeFile(screenshotPath, screenshot.stdout)
    }
    await collectAndroidArtifacts(artifactDir)
    return report
  }
  finally {
    await collectAndroidLogcat(artifactDir)
    const restoreArguments = hiddenErrorDialogs === 'null'
      ? ['shell', 'settings', 'delete', 'global', 'hide_error_dialogs']
      : ['shell', 'settings', 'put', 'global', 'hide_error_dialogs', hiddenErrorDialogs]
    await execa('adb', restoreArguments, { reject: false })
  }
}

async function runIos(hostDir: string, artifactDir: string) {
  await command('xcodegen', ['generate'], hostDir, 60_000)
  await command('pod', ['install', '--repo-update'], hostDir, 600_000)
  await command('xcrun', ['simctl', 'bootstatus', 'booted', '-b'], hostDir, 120_000)
  const deviceId = process.env['LYNX_IOS_DEVICE_ID'] ?? await bootedIosDeviceId(hostDir)
  const derivedData = path.join(hostDir, 'DerivedData')
  await command('xcodebuild', [
    '-quiet',
    '-workspace',
    'LynxCompatibilityHost.xcworkspace',
    '-scheme',
    'LynxCompatibilityHost',
    '-configuration',
    'Debug',
    '-sdk',
    'iphonesimulator',
    '-destination',
    process.env['LYNX_IOS_DESTINATION'] ?? `platform=iOS Simulator,id=${deviceId}`,
    '-derivedDataPath',
    derivedData,
    'COMPILER_INDEX_STORE_ENABLE=NO',
    'build',
  ], hostDir, 1_800_000)
  const appPath = path.join(derivedData, 'Build', 'Products', 'Debug-iphonesimulator', 'LynxCompatibilityHost.app')
  await command('xcrun', ['simctl', 'install', deviceId, appPath], hostDir, 120_000)
  const container = (await command('xcrun', ['simctl', 'get_app_container', deviceId, applicationId, 'data'], hostDir, 30_000)).trim()
  const reportPath = path.join(container, 'Library', 'Application Support', 'lynx-compat', 'report.json')
  await fs.rm(reportPath, { force: true })
  await command('xcrun', ['simctl', 'launch', '--terminate-running-process', deviceId, applicationId], hostDir, 60_000)
  const report = await waitForReport(async () => fs.readFile(reportPath, 'utf8').catch(() => undefined))
  await command('xcrun', ['simctl', 'io', deviceId, 'screenshot', path.join(artifactDir, 'screen.png')], hostDir, 60_000)
  await collectIosArtifacts(container, artifactDir)
  return report
}

async function compareCommittedReport(actual: NativePlatformReport) {
  const expectedPath = defaultReportPath(platform)
  const expected = await fs.readFile(expectedPath, 'utf8').then(source => JSON.parse(source) as NativePlatformReport).catch(() => undefined)
  if (!expected) {
    throw new Error(`缺少已提交的 ${platform} 报告：${path.relative(repoRoot, expectedPath)}`)
  }
  if (JSON.stringify(nativeReportConclusion(actual)) !== JSON.stringify(nativeReportConclusion(expected))) {
    throw new Error(`${platform} 运行时结论与已提交报告不一致，请审查 artifact 后显式刷新双端基线。`)
  }
}

async function main() {
  const temporaryRoot = process.env['LYNX_NATIVE_WORK_DIR']
    ? path.resolve(process.env['LYNX_NATIVE_WORK_DIR'])
    : await fs.mkdtemp(path.join(os.tmpdir(), `weapp-tailwindcss-lynx-${platform}-`))
  const hostDir = path.join(temporaryRoot, 'host')
  const artifactDir = path.join(repoRoot, 'e2e', '.artifacts', 'lynx-native', `${platform}-${Date.now()}`)
  await Promise.all([
    fs.cp(fixtureDir, hostDir, { recursive: true }),
    fs.mkdir(artifactDir, { recursive: true }),
  ])
  const build = await buildCompatibilityBundle()
  const bundlePath = path.join(exampleDir, 'dist', 'main.lynx.bundle')
  const stagedBundle = platform === 'android'
    ? path.join(hostDir, 'app', 'src', 'main', 'assets', 'main.lynx.bundle')
    : path.join(hostDir, 'App', 'main.lynx.bundle')
  await fs.mkdir(path.dirname(stagedBundle), { recursive: true })
  await Promise.all([
    fs.copyFile(bundlePath, stagedBundle),
    fs.copyFile(bundlePath, path.join(artifactDir, 'main.lynx.bundle')),
    fs.copyFile(path.join(exampleDir, 'dist', '.rspeedy', 'main', 'main.css'), path.join(artifactDir, 'main.css')),
    fs.writeFile(path.join(artifactDir, 'encoder.log'), build.encoderLog),
  ])

  try {
    const reportSource = platform === 'android'
      ? await runAndroid(hostDir, artifactDir)
      : await runIos(hostDir, artifactDir)
    await fs.writeFile(path.join(artifactDir, 'raw-report.json'), `${reportSource.trim()}\n`)
    const report = validateNativeReport(await enrichEnvironment(JSON.parse(reportSource) as NativePlatformReport, hostDir), platform)
    await fs.writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
    await compareCommittedReport(report)
    process.stdout.write(`${JSON.stringify({ platform, artifactDir, cases: report.results.length }, null, 2)}\n`)
  }
  catch (error) {
    await fs.writeFile(path.join(artifactDir, 'failure.txt'), `${error instanceof Error ? error.stack : String(error)}\n`)
    throw error
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
