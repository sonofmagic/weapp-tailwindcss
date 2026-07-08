import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_PROXY_HOST = '127.0.0.1'
const DEFAULT_PROXY_PORT = 7890
const DEFAULT_PROXY_URL = `http://${DEFAULT_PROXY_HOST}:${DEFAULT_PROXY_PORT}`
const CONNECT_TIMEOUT_MS = 500
const UPDATE_COMMANDS = new Set(['up', 'update'])

export const UPDATE_METADATA_CACHE_PATTERNS = ['*']

export function parseProxyUrl(value) {
  if (!value) {
    return {
      host: DEFAULT_PROXY_HOST,
      port: DEFAULT_PROXY_PORT,
      url: DEFAULT_PROXY_URL,
    }
  }

  const url = new URL(value)
  const fallbackPort = url.protocol === 'https:' ? 443 : 80

  return {
    host: url.hostname,
    port: Number(url.port || fallbackPort),
    url: value,
  }
}

export function canConnect({ host, port }) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })

    socket.setTimeout(CONNECT_TIMEOUT_MS)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

export function shouldRefreshMetadataCache(args) {
  return args.some(arg => UPDATE_COMMANDS.has(arg))
}

export function createPnpmEnv(sourceEnv, { proxyAvailable, proxy }) {
  const env = {
    ...sourceEnv,
    npm_config_proxy: proxyAvailable ? proxy.url : '',
    npm_config_https_proxy: proxyAvailable ? proxy.url : '',
    npm_config_noproxy: 'localhost,127.0.0.1,::1',
  }

  delete env.HTTP_PROXY
  delete env.HTTPS_PROXY
  delete env.ALL_PROXY
  delete env.http_proxy
  delete env.https_proxy
  delete env.all_proxy

  return env
}

export function refreshUpdateMetadataCache({ spawnSyncImpl = spawnSync } = {}) {
  console.log('[pnpm-smart-proxy] 更新前刷新 pnpm metadata cache')

  const result = spawnSyncImpl('pnpm', ['cache', 'delete', ...UPDATE_METADATA_CACHE_PATTERNS], {
    shell: false,
    stdio: ['ignore', 'ignore', 'inherit'],
  })

  if (result.error) {
    console.error('[pnpm-smart-proxy] 刷新 pnpm metadata cache 失败：', result.error)
    return false
  }

  if (result.status !== 0) {
    console.error(`[pnpm-smart-proxy] 刷新 pnpm metadata cache 失败，退出码：${result.status ?? 1}`)
    return false
  }

  return true
}

export async function main({
  argv = process.argv.slice(2),
  env = process.env,
  spawnImpl = spawn,
  spawnSyncImpl = spawnSync,
  canConnectImpl = canConnect,
} = {}) {
  if (shouldRefreshMetadataCache(argv) && !refreshUpdateMetadataCache({ spawnSyncImpl })) {
    process.exit(1)
  }

  const proxy = parseProxyUrl(env.PNPM_SMART_PROXY_URL)
  const proxyAvailable = await canConnectImpl(proxy)
  const proxyArgs = proxyAvailable
    ? [`--config.proxy=${proxy.url}`, `--config.https-proxy=${proxy.url}`]
    : ['--config.proxy=', '--config.https-proxy=']

  console.log(
    proxyAvailable
      ? `[pnpm-smart-proxy] 使用本地代理：${proxy.url}`
      : `[pnpm-smart-proxy] 本地代理未开放，直连 registry：${proxy.host}:${proxy.port}`,
  )

  const child = spawnImpl('pnpm', [...proxyArgs, ...argv], {
    env: createPnpmEnv(env, { proxyAvailable, proxy }),
    shell: false,
    stdio: 'inherit',
  })

  child.once('error', (error) => {
    console.error(error)
    process.exit(1)
  })

  child.once('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 1)
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main()
}
