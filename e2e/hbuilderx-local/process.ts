import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'

const hbuilderxCliCandidates = [
  process.env['HBUILDERX_CLI_PATH'],
  process.platform === 'darwin' ? '/Applications/HBuilderX.app/Contents/MacOS/cli' : undefined,
].filter((item): item is string => Boolean(item))
const chromeExecutableCandidates = [
  process.env['E2E_HBUILDERX_CHROME_PATH'],
  process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
].filter((item): item is string => Boolean(item))
const localUrlRE = /Local:\s*(https?:\/\/\S+)/i
const androidSdkCandidates = [
  process.env['ANDROID_HOME'],
  process.env['ANDROID_SDK_ROOT'],
  process.env['HOME'] ? path.join(process.env['HOME'], 'Library/Android/sdk') : undefined,
  '/opt/android-sdk',
  '/usr/local/share/android-sdk',
].filter((item): item is string => Boolean(item))

export const serverTimeoutMs = Number(process.env['E2E_HBUILDERX_WEB_TIMEOUT_MS'] ?? 180_000)
export const hbuilderxTimeoutMs = Number(process.env['E2E_HBUILDERX_MP_TIMEOUT_MS'] ?? 240_000)
export const hbuilderxAppTimeoutMs = Number(process.env['E2E_HBUILDERX_APP_TIMEOUT_MS'] ?? 600_000)
export const pollIntervalMs = 500

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fileExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

export async function resolveHBuilderXCli() {
  for (const item of hbuilderxCliCandidates) {
    if (await fileExists(item)) {
      return item
    }
  }
  throw new Error('未找到 HBuilderX CLI。请先安装 HBuilderX，或设置 HBUILDERX_CLI_PATH=/path/to/cli。')
}

export async function resolveChromeExecutable() {
  for (const item of chromeExecutableCandidates) {
    if (await fileExists(item)) {
      return item
    }
  }
  return undefined
}

function runTool(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
  })
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  }
}

function resolveAdbCommand() {
  const adb = runTool('adb', ['version'])
  if (adb.ok) {
    return {
      command: 'adb',
      output: adb.output,
      env: {},
    }
  }

  for (const sdkRoot of androidSdkCandidates) {
    const adbPath = path.join(sdkRoot, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb')
    const candidate = runTool(adbPath, ['version'])
    if (candidate.ok) {
      return {
        command: adbPath,
        output: candidate.output,
        env: {
          ANDROID_HOME: process.env['ANDROID_HOME'] ?? sdkRoot,
          ANDROID_SDK_ROOT: process.env['ANDROID_SDK_ROOT'] ?? sdkRoot,
          PATH: `${path.dirname(adbPath)}${path.delimiter}${process.env['PATH'] ?? ''}`,
        },
      }
    }
  }

  return {
    command: 'adb',
    output: adb.output,
    env: undefined,
  }
}

export function assertAndroidToolchain() {
  const adb = resolveAdbCommand()

  if (!adb.env && adb.command === 'adb') {
    throw new Error([
      '当前机器缺少 Android App E2E 所需的 adb，无法运行 HBuilderX app-android E2E。',
      `adb: ${adb.output || 'not found'}`,
      '请先安装 Android SDK platform-tools，并确认 adb 可在 PATH 中访问。',
      '如需指定设备，请设置 E2E_HBUILDERX_ANDROID_DEVICE_ID。',
    ].join('\n'))
  }

  return adb.env
}

export function assertIosSimulatorToolchain() {
  if (process.platform !== 'darwin') {
    throw new Error('HBuilderX iOS 模拟器 E2E 只能在 macOS 本地运行。')
  }

  const xcodeSelect = runTool('xcode-select', ['-p'])
  const simctl = runTool('xcrun', ['--find', 'simctl'])
  const xcodebuild = runTool('xcrun', ['--find', 'xcodebuild'])
  const firstLaunchStatus = xcodebuild.ok ? runTool('xcodebuild', ['-checkFirstLaunchStatus']) : undefined

  if (!simctl.ok || !xcodebuild.ok || firstLaunchStatus?.ok === false) {
    throw new Error([
      '当前机器缺少 iOS 模拟器所需的完整 Xcode 工具链，无法运行 HBuilderX app-ios E2E。',
      `xcode-select: ${xcodeSelect.output || 'unknown'}`,
      `DEVELOPER_DIR: ${process.env['DEVELOPER_DIR'] || '未设置'}`,
      `simctl: ${simctl.output || 'not found'}`,
      `xcodebuild: ${xcodebuild.output || 'not found'}`,
      `firstLaunchStatus: ${firstLaunchStatus?.output || (firstLaunchStatus?.ok === false ? 'not ready' : 'unknown')}`,
      '请安装完整 Xcode，并执行 sudo xcode-select -s /Applications/Xcode.app/Contents/Developer，或用 DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer 临时指定后重试。',
      '如果 firstLaunchStatus 不是 ready，请先打开 Xcode 完成首次组件安装，或执行 sudo xcodebuild -runFirstLaunch。',
    ].join('\n'))
  }
}

export async function findFreePort() {
  return await new Promise<number>((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('无法解析可用端口')))
        return
      }
      const { port } = address
      server.close(() => resolve(port))
    })
  })
}

export function killProcessTree(child: ChildProcess) {
  const pid = child.pid
  if (!pid || child.exitCode != null) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    return
  }

  try {
    process.kill(-pid, 'SIGTERM')
  }
  catch {
    try {
      child.kill('SIGTERM')
    }
    catch {
    }
  }
}

export function collectProcessOutput(child: ChildProcess) {
  const logs: string[] = []
  const collect = (chunk: Buffer | string) => {
    const text = chunk.toString()
    logs.push(text)
    if (logs.length > 160) {
      logs.splice(0, logs.length - 160)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return logs
}

export function spawnPnpm(projectRoot: string, args: string[], env: Record<string, string | undefined> = {}) {
  return spawn('pnpm', args, {
    cwd: projectRoot,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ...env,
      HBUILDERX_CLI_PATH: process.env['HBUILDERX_CLI_PATH'] ?? hbuilderxCliCandidates[0],
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
    },
  })
}

export async function runPnpm(projectRoot: string, args: string[], timeoutMs: number, env: Record<string, string | undefined> = {}) {
  const child = spawnPnpm(projectRoot, args, env)
  const logs = collectProcessOutput(child)

  return await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      killProcessTree(child)
      reject(new Error(`命令超时：pnpm ${args.join(' ')}\n${logs.join('')}`))
    }, timeoutMs)

    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`命令失败：pnpm ${args.join(' ')} exit=${signal ?? code}\n${logs.join('')}`))
    })
  })
}

export async function readUtf8(file: string) {
  return await fs.readFile(file, 'utf8')
}

export function joinUrl(baseUrl: string, requestPath: string) {
  return `${baseUrl.replace(/\/$/, '')}${requestPath}`
}

export function resolveBaseUrls(logs: string[], fallbackUrl: string) {
  const urls = new Set([fallbackUrl])
  for (const chunk of logs) {
    for (const line of chunk.split(/\r?\n/)) {
      const matched = line.match(localUrlRE)?.[1]
      if (matched) {
        urls.add(matched)
      }
    }
  }
  return Array.from(urls)
}

export async function fetchText(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status} ${response.statusText}`)
  }
  return await response.text()
}
