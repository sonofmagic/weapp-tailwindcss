import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'

const LOCAL_URL_RE = /\b(?:Local|Network|ready in|localhost|127\.0\.0\.1)[^\n]*?(https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\/?)/gi

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
      server.close(() => resolve(address.port))
    })
  })
}

export function killProcessTree(child: ChildProcess | undefined) {
  if (!child?.pid || child.exitCode != null) {
    return
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    return
  }
  try {
    process.kill(-child.pid, 'SIGTERM')
  }
  catch {
    child.kill('SIGTERM')
  }
}

export function spawnPnpm(cwd: string, args: string[], env: Record<string, string | undefined> = {}) {
  const child = spawn('pnpm', args, {
    cwd,
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      BROWSER: 'none',
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
      ...env,
    },
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const logs: string[] = []
  const collect = (chunk: Buffer | string) => {
    logs.push(chunk.toString())
    if (logs.length > 160) {
      logs.splice(0, logs.length - 160)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return { child, logs }
}

function stripAnsiEscapes(input: string) {
  let output = ''
  for (let index = 0; index < input.length; index++) {
    const charCode = input.charCodeAt(index)
    if (charCode !== 27 || input[index + 1] !== '[') {
      output += input[index]
      continue
    }
    index += 2
    while (index < input.length) {
      const code = input.charCodeAt(index)
      if (code >= 0x40 && code <= 0x7E) {
        break
      }
      index++
    }
  }
  return output
}

function normalizeLocalUrls(url: string) {
  const urls = new Set([url])
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'localhost' || parsed.hostname === '[::1]') {
      parsed.hostname = '127.0.0.1'
      urls.add(parsed.toString())
    }
    return [...urls]
  }
  catch {
    return [...urls]
  }
}

function resolveCandidateUrls(logs: string[], fallbackUrl: string) {
  const urls = new Set([fallbackUrl])
  for (const chunk of logs) {
    const text = stripAnsiEscapes(chunk)
    LOCAL_URL_RE.lastIndex = 0
    let match = LOCAL_URL_RE.exec(text)
    while (match !== null) {
      if (match[1]) {
        for (const url of normalizeLocalUrls(match[1])) {
          urls.add(url)
        }
      }
      match = LOCAL_URL_RE.exec(text)
    }
  }
  return [...urls]
}

export async function waitForUrl(url: string, child: ChildProcess, logs: string[], timeoutMs: number) {
  const started = Date.now()
  let lastError: unknown
  while (Date.now() - started < timeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev server 提前退出 exit=${child.exitCode}\n${logs.join('')}`)
    }
    for (const candidate of resolveCandidateUrls(logs, url)) {
      try {
        const response = await fetch(candidate)
        if (response.ok) {
          return candidate
        }
        lastError = new Error(`${candidate} -> ${response.status} ${response.statusText}`)
      }
      catch (error) {
        lastError = error
      }
    }
    await wait(500)
  }
  throw new Error(`等待 ${url} 超时：${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}
