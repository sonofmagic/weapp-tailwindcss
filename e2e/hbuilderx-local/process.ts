import net from 'node:net'
import process from 'node:process'
import {
  assertAndroidToolchain,
  assertHarmonyToolchain,
  assertIosSimulatorToolchain,
  classifyHBuilderXOutput,
  collectProcessOutput,
  fileExists,
  killProcessTree,
  readUtf8,
  resolveHBuilderXCli,
  resolveHdcCommand,
  runPnpmCommand,
  spawnPnpmCommand,
  wait,
} from '../../packages/hbuilderx-runner/src'

const chromeExecutableCandidates = [
  process.env['E2E_HBUILDERX_CHROME_PATH'],
  process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
].filter((item): item is string => Boolean(item))
const localUrlRE = /Local:\s*(https?:\/\/\S+)/i

export const serverTimeoutMs = Number(process.env['E2E_HBUILDERX_WEB_TIMEOUT_MS'] ?? 180_000)
export const hbuilderxTimeoutMs = Number(process.env['E2E_HBUILDERX_MP_TIMEOUT_MS'] ?? 240_000)
export const hbuilderxAppTimeoutMs = Number(process.env['E2E_HBUILDERX_APP_TIMEOUT_MS'] ?? 600_000)
export const pollIntervalMs = 500

export {
  assertAndroidToolchain,
  assertHarmonyToolchain,
  assertIosSimulatorToolchain,
  classifyHBuilderXOutput,
  collectProcessOutput,
  fileExists,
  killProcessTree,
  readUtf8,
  resolveHBuilderXCli,
  resolveHdcCommand,
  wait,
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

export function spawnPnpm(projectRoot: string, args: string[], env: Record<string, string | undefined> = {}) {
  return spawnPnpmCommand({
    cwd: projectRoot,
    args,
    env,
    hbuilderxCliPath: process.env['HBUILDERX_CLI_PATH'],
  }).child
}

export async function runPnpm(projectRoot: string, args: string[], timeoutMs: number, env: Record<string, string | undefined> = {}) {
  await runPnpmCommand({
    cwd: projectRoot,
    args,
    timeoutMs,
    env,
    hbuilderxCliPath: process.env['HBUILDERX_CLI_PATH'],
  })
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
