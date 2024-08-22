import process from 'node:process'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { defu } from '@weapp-core/shared'
import path from 'pathe'
import { watch } from 'chokidar'
import { build } from 'vite'
import type { UserConfig, WatchOptions } from './types'
import type { Context } from './context'
import { RootRollupSymbol } from './symbols'
import { getDefaultViteConfig, getWeappWatchOptions } from './defaults'

export async function runDev(ctx: Context, options?: UserConfig) {
  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'development'
  }
  const inlineConfig = defu<UserConfig, UserConfig[]>(
    options,
    await getDefaultViteConfig(ctx),
    {
      mode: 'development',
      build: {
        watch: {},
        minify: false,
        emptyOutDir: false,
      },
    },
  )
  async function innerDev() {
    const rollupWatcher = (await build(
      inlineConfig,
    )) as RollupWatcher
    const key = options?.weapp?.subPackage?.root || RootRollupSymbol

    const watcher = ctx.watcherCache.get(key)
    watcher?.close()
    ctx.watcherCache.set(key, rollupWatcher)

    return rollupWatcher
  }
  // 小程序分包的情况，再此创建一个 watcher
  if (options?.weapp?.subPackage) {
    return await innerDev()
  }
  else {
    const { paths, ...opts } = defu<Required<WatchOptions>, WatchOptions[]>(inlineConfig.weapp?.watch, {
      ignored: [
        path.join(ctx.mpRoot, '**'),
      ],
      cwd: ctx.cwd,
    }, getWeappWatchOptions())
    const watcher = watch(paths, opts)
    let isReady = false
    watcher.on('all', async (eventName) => {
      if (isReady && (eventName === 'add' || eventName === 'change' || eventName === 'unlink')) {
        await innerDev()
      }
    }).on('ready', async () => {
      await innerDev()
      isReady = true
    })

    return watcher
  }
}

export async function runProd(ctx: Context, options?: UserConfig) {
  const output = (await build(
    defu<UserConfig, UserConfig[]>(
      options,
      await getDefaultViteConfig(ctx),
      {
        mode: 'production',
      },
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
