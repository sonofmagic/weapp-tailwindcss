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
    try {
      process.stdout.write(`[weapp-hmr] ${name}: launch ${projectPath} port=${port} attempt=${attempt}/${retries + 1}\n`)
      const miniProgram = await withTimeout(`${name} launch`, timeoutMs, new Launcher().launch({
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
      await cleanupWechatDevTools()
      if (attempt > retries || !isRetryableLaunchError(error)) {
        throw error
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
