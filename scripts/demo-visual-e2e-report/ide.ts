import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import { findFreePort } from './process.ts'

const defaultCloseTimeoutMs = 5000

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function shouldCleanupWechatDevTools() {
  return process.env['DEMO_VISUAL_IDE_CLEANUP'] !== '0'
}

export async function cleanupWechatDevTools() {
  if (process.platform !== 'darwin' || !shouldCleanupWechatDevTools()) {
    return
  }
  const timeout = readNumberEnv('DEMO_VISUAL_IDE_CLEANUP_TIMEOUT_MS', defaultCloseTimeoutMs)
  try {
    await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
      timeout,
    })
  }
  catch {}
  await execa('pkill', ['-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  }).catch(() => undefined)
  await execa('pkill', ['-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  }).catch(() => undefined)

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeout) {
    try {
      await execa('pgrep', ['-f', 'wechat(web)?devtools'], {
        timeout: 1000,
      })
      await wait(250)
    }
    catch {
      return
    }
  }

  await execa('pkill', ['-9', '-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  }).catch(() => undefined)
  await execa('pkill', ['-9', '-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  }).catch(() => undefined)
}

export function parseWechatDevToolsWindowBounds(value: string) {
  const bounds = value.trim().split(',').map(part => Number(part.trim()))
  if (bounds.length !== 4 || bounds.some(part => !Number.isFinite(part) || part < 0)) {
    throw new Error(`无法解析微信开发者工具窗口边界: ${value}`)
  }
  const [left, top, width, height] = bounds
  if (width === 0 || height === 0) {
    throw new Error(`微信开发者工具窗口尺寸无效: ${value}`)
  }
  return `${left},${top},${width},${height}`
}

export async function captureWechatDevToolsWindow(screenshot: string) {
  if (process.platform !== 'darwin') {
    throw new Error('微信开发者工具窗口截图当前仅支持 macOS')
  }
  const script = [
    'tell application "System Events"',
    'set targetProcess to first application process whose name contains "wechatwebdevtools"',
    'set frontmost of targetProcess to true',
    'tell targetProcess',
    'set windowPosition to position of front window',
    'set windowSize to size of front window',
    'end tell',
    'return (item 1 of windowPosition as text) & "," & (item 2 of windowPosition as text) & "," & (item 1 of windowSize as text) & "," & (item 2 of windowSize as text)',
    'end tell',
  ].join('\n')
  const { stdout } = await execa('osascript', ['-e', script], { timeout: 5000 })
  const bounds = parseWechatDevToolsWindowBounds(stdout)
  await execa('screencapture', ['-x', '-R', bounds, screenshot], { timeout: 10_000 })
}

async function closeMiniProgram(miniProgram: any, name: string) {
  if (!miniProgram) {
    return
  }
  const timeoutMs = readNumberEnv('DEMO_VISUAL_IDE_CLOSE_TIMEOUT_MS', 10_000)
  try {
    await Promise.race([
      miniProgram.close(),
      wait(timeoutMs),
    ])
  }
  catch (error) {
    process.stderr.write(`[weapp-hmr] ${name}: close failed: ${error instanceof Error ? error.message : String(error)}\n`)
  }
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

function isRetryableLaunchError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /launch 超时|Wait timed out|Failed connecting|Failed to launch wechat web devTools|DevTools did not respond/i.test(message)
}

export async function launchMiniProgramInCleanDevTools(
  name: string,
  projectPath: string,
  preferredPort: number | undefined,
  timeoutMs: number,
) {
  const retries = readNumberEnv('DEMO_VISUAL_IDE_LAUNCH_RETRIES', 1)
  const settleMs = readNumberEnv('DEMO_VISUAL_IDE_SETTLE_MS', 800)
  let lastError: unknown

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    await cleanupWechatDevTools()
    await wait(settleMs)
    const port = attempt === 1 ? preferredPort : await findFreePort()
    const launcher = new Launcher()
    try {
      process.stdout.write(`[weapp-hmr] ${name}: launch ${projectPath} port=${port} attempt=${attempt}/${retries + 1}\n`)
      const miniProgram = await withTimeout(`${name} launch`, timeoutMs, launcher.launch({
        projectPath,
        port,
        timeout: timeoutMs,
      }))
      return {
        miniProgram,
        port,
      }
    }
    catch (error) {
      lastError = error
      if (isRetryableLaunchError(error)) {
        try {
          const connectTimeoutMs = Math.min(timeoutMs, readNumberEnv('DEMO_VISUAL_IDE_CONNECT_TIMEOUT_MS', 10_000))
          process.stderr.write(`[weapp-hmr] ${name}: connect existing DevTools session after launch timeout port=${port}\n`)
          const miniProgram = await withTimeout<any>(
            `${name} connect existing session`,
            connectTimeoutMs,
            launcher.connect({ timeout: connectTimeoutMs, wsEndpoint: `ws://127.0.0.1:${port}` }),
          )
          return { miniProgram, port }
        }
        catch (connectError) {
          lastError = connectError
        }
      }
      await cleanupWechatDevTools()
      if (attempt > retries || !isRetryableLaunchError(lastError)) {
        throw lastError
      }
      process.stderr.write(`[weapp-hmr] ${name}: retry launch after DevTools error (${attempt}/${retries})\n`)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export async function closeMiniProgramAndCleanup(miniProgram: any, name: string) {
  await closeMiniProgram(miniProgram, name)
  await cleanupWechatDevTools()
}
