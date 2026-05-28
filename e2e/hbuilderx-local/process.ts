import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import net from 'node:net'
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

export const serverTimeoutMs = Number(process.env['E2E_HBUILDERX_WEB_TIMEOUT_MS'] ?? 180_000)
export const hbuilderxTimeoutMs = Number(process.env['E2E_HBUILDERX_MP_TIMEOUT_MS'] ?? 240_000)
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
