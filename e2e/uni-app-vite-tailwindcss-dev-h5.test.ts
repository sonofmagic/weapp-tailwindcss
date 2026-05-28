import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '..')
const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/
const localUrlRE = /Local:\s*(https?:\/\/\S+)/i
const pollIntervalMs = 500
const serverTimeoutMs = 180_000

interface CssModuleExpectation {
  label: string
  path: string
  contains: Array<string | RegExp>
}

interface DevH5Case {
  name: string
  projectDir: string
  modules: CssModuleExpectation[]
}

const cases: DevH5Case[] = [
  {
    name: 'uni-app vite Tailwind v3',
    projectDir: 'demo/uni-app-vite-tailwindcss-v3',
    modules: [
      {
        label: 'App.vue style HMR module',
        path: '/src/App.vue?vue&type=style&index=0&lang.scss',
        contains: ['.raw-btn', '.btn', '.flex', /background-image:\s*linear-gradient/],
      },
      {
        label: 'tailwind.scss direct module',
        path: '/src/tailwind.scss?direct',
        contains: ['.raw-btn', '.btn', '.flex', /background-image:\s*linear-gradient/],
      },
    ],
  },
  {
    name: 'uni-app vite Tailwind v4',
    projectDir: 'demo/uni-app-vite-tailwindcss-v4',
    modules: [
      {
        label: 'main.css direct module',
        path: '/src/main.css?direct',
        contains: ['.flex', '.bg-midnight', '--color-midnight', '.i-mdi-home'],
      },
      {
        label: 'normal subpackage css direct module',
        path: '/src/sub-normal/pages/index.css?direct',
        contains: ['.bg-normal-subpackage-marker'],
      },
      {
        label: 'independent subpackage css direct module',
        path: '/src/sub-independent/pages/index.css?direct',
        contains: ['.bg-independent-subpackage-marker'],
      },
    ],
  },
]

let devProcess: ChildProcess | undefined

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function findFreePort() {
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

function killProcessTree(child: ChildProcess) {
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

function createDevServer(projectRoot: string, port: number) {
  const child = spawn('pnpm', ['run', 'dev:h5'], {
    cwd: projectRoot,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      BROWSER: 'none',
      WEAPP_TW_WATCH_REGRESSION: '1',
      VITE_WEAPP_TW_WATCH_REGRESSION: '1',
      HOST: '127.0.0.1',
      PORT: String(port),
      UNI_CLI_SERVER_HOST: '127.0.0.1',
      UNI_CLI_SERVER_PORT: String(port),
      CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
      CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
    },
  })
  devProcess = child
  return child
}

function collectProcessOutput(child: ChildProcess) {
  const logs: string[] = []
  const collect = (chunk: Buffer | string) => {
    const text = chunk.toString()
    logs.push(text)
    if (logs.length > 120) {
      logs.splice(0, logs.length - 120)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return logs
}

function resolveBaseUrls(logs: string[], fallbackUrl: string) {
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

function joinUrl(baseUrl: string, requestPath: string) {
  return `${baseUrl.replace(/\/$/, '')}${requestPath}`
}

async function waitForCssModule(
  requestPath: string,
  child: ChildProcess,
  logs: string[],
  fallbackBaseUrl: string,
) {
  const startedAt = Date.now()
  let lastFetchError: unknown

  while (Date.now() - startedAt < serverTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev:h5 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }

    for (const baseUrl of resolveBaseUrls(logs, fallbackBaseUrl)) {
      try {
        const response = await fetch(joinUrl(baseUrl, requestPath))
        if (response.ok) {
          return await response.text()
        }
        lastFetchError = new Error(`${baseUrl} -> HTTP ${response.status} ${response.statusText}`)
      }
      catch (error) {
        lastFetchError = error
      }
    }

    await wait(pollIntervalMs)
  }

  const errorText = lastFetchError instanceof Error ? lastFetchError.message : String(lastFetchError)
  throw new Error(`等待 dev:h5 CSS 模块超时：${requestPath}\nlastFetch=${errorText}\n${logs.join('')}`)
}

function expectGeneratedTailwindCssModule(source: string, expectation: CssModuleExpectation) {
  expect(source, `${expectation.label} 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  expect(source, `${expectation.label} 应包含 weapp-tailwindcss 生成标记`).toContain('weapp-tailwindcss vite-generated-css')
  for (const item of expectation.contains) {
    if (typeof item === 'string') {
      expect(source, `${expectation.label} 应包含 ${item}`).toContain(item)
    }
    else {
      expect(source, `${expectation.label} 应匹配 ${item}`).toMatch(item)
    }
  }
}

describe('uni-app vite Tailwind dev H5 css hmr', () => {
  afterEach(() => {
    if (devProcess) {
      killProcessTree(devProcess)
      devProcess = undefined
    }
  })

  it.each(cases)('generates CSS for $name Vite dev style modules', async (item) => {
    const port = await findFreePort()
    const projectRoot = path.resolve(repoRoot, item.projectDir)
    const child = createDevServer(projectRoot, port)
    const logs = collectProcessOutput(child)
    const fallbackBaseUrl = `http://127.0.0.1:${port}/`

    for (const cssModule of item.modules) {
      const source = await waitForCssModule(cssModule.path, child, logs, fallbackBaseUrl)
      expectGeneratedTailwindCssModule(source, cssModule)
    }
  }, serverTimeoutMs + 30_000)
})
