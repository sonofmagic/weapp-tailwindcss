import { describe, expect, it } from 'vitest'

import {
  createPnpmEnv,
  refreshUpdateMetadataCache,
  shouldRefreshMetadataCache,
  UPDATE_METADATA_CACHE_PATTERNS,
} from '../../../scripts/pnpm-smart-proxy.mjs'

describe('pnpm-smart-proxy', () => {
  it('only refreshes metadata cache for pnpm update commands', () => {
    expect(shouldRefreshMetadataCache(['up', '-ri', '!@dcloudio/*'])).toBe(true)
    expect(shouldRefreshMetadataCache(['update', '-r'])).toBe(true)
    expect(shouldRefreshMetadataCache(['install'])).toBe(false)
    expect(shouldRefreshMetadataCache(['run', 'build'])).toBe(false)
  })

  it('deletes all pnpm metadata cache before dependency updates', () => {
    const calls: Array<{ args: string[], command: string, options: unknown }> = []
    const ok = refreshUpdateMetadataCache({
      spawnSyncImpl(command: string, args: string[], options: unknown) {
        calls.push({ args, command, options })
        return { status: 0 }
      },
    })

    expect(ok).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0]?.command).toBe('pnpm')
    expect(calls[0]?.args).toEqual(['cache', 'delete', ...UPDATE_METADATA_CACHE_PATTERNS])
    expect(calls[0]?.options).toMatchObject({ stdio: ['ignore', 'ignore', 'inherit'] })
    expect(UPDATE_METADATA_CACHE_PATTERNS).toEqual(['*'])
  })

  it('removes ambient proxy variables when proxy is unavailable', () => {
    const env = createPnpmEnv({
      ALL_PROXY: 'http://127.0.0.1:7890',
      HTTPS_PROXY: 'http://127.0.0.1:7890',
      HTTP_PROXY: 'http://127.0.0.1:7890',
      keep: 'value',
    }, {
      proxy: { url: 'http://127.0.0.1:7890' },
      proxyAvailable: false,
    })

    expect(env.keep).toBe('value')
    expect(env.npm_config_proxy).toBe('')
    expect(env.npm_config_https_proxy).toBe('')
    expect(env.HTTP_PROXY).toBeUndefined()
    expect(env.HTTPS_PROXY).toBeUndefined()
    expect(env.ALL_PROXY).toBeUndefined()
  })
})
