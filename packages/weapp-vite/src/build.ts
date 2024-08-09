import process from 'node:process'
import type { InlineConfig } from 'vite'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import { readPackageJSON } from 'pkg-types'
import { vitePluginWeapp } from './plugins'
import type { Context } from './context'
import { RootSymbol } from './symbols'

export async function getDefaultConfig(ctx: Context, _options?: InlineConfig): Promise<InlineConfig> {
  // const root = options?.root ?? process.cwd()
  const localPackageJson = await readPackageJSON()
  const external: string[] = []
  if (localPackageJson.dependencies) {
    external.push(...Object.keys(localPackageJson.dependencies))
  }
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
        external,
      },
      assetsDir: '.',
      commonjsOptions: {
        transformMixedEsModules: true,
        include: undefined,
      },
      emptyOutDir: false,
    },
    plugins: [
      vitePluginWeapp(ctx),
    ],
    // logLevel: 'silent',
  }
}

export async function runDev(ctx: Context, options?: InlineConfig) {
  process.env.NODE_ENV = 'development'
  const watcher = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      await getDefaultConfig(ctx, options),
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

  ctx.watcherCache.set(options?.weapp?.subPackage?.root || RootSymbol, watcher)

  // watcher.on('event', (event) => {
  //   console.log(event)
  // })

  return watcher
}

export async function runProd(ctx: Context, options?: InlineConfig) {
  const output = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      // {
      //   build: {
      //     emptyOutDir: true,
      //   },
      // },
      await getDefaultConfig(ctx, options),
      {
        mode: 'production',
      },
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
