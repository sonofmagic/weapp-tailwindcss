import process from 'node:process'
import type { InlineConfig } from 'vite'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import { vitePluginWeapp } from './plugins'
import type { Context } from './context'
import { RootSymbol } from './symbols'

export function getDefaultConfig(ctx: Context): InlineConfig {
  return {
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name.endsWith('.ts')) {
              const baseFileName = removeExtension(chunkInfo.name)
              if (baseFileName.endsWith('.wxs')) {
                return baseFileName
              }
              return addExtension(baseFileName, '.js')
            }
            return chunkInfo.name
          },
        },
      },
      assetsDir: '.',
      commonjsOptions: {
        transformMixedEsModules: true,
        include: undefined,
      },
    },
    plugins: [
      vitePluginWeapp(ctx),
    ],
  }
}

export async function runDev(ctx: Context, options?: InlineConfig) {
  process.env.NODE_ENV = 'development'
  const watcher = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      getDefaultConfig(ctx),
      {
        mode: 'development',
        build: {
          watch: {},
          minify: false,
        },
      },
    )
    ,
  )) as RollupWatcher

  ctx.watcherCache.set(options?.weapp?.srcRoot || RootSymbol, watcher)
  // watcher.on('event', (event) => {
  //   console.log(event)
  // })

  return watcher
}

export async function runProd(ctx: Context, options?: InlineConfig) {
  const output = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      getDefaultConfig(ctx),
      {
        mode: 'production',
      },
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
