import process from 'node:process'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import { readPackageJSON } from 'pkg-types'
import path from 'pathe'
import type { UserConfig } from './types'
import { vitePluginWeapp } from './plugins'
import type { Context } from './context'
import { RootSymbol } from './symbols'

export async function getDefaultConfig(ctx: Context): Promise<UserConfig> {
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
            const name = ctx.relativeSrcRoot(chunkInfo.name)
            if (name.endsWith('.ts')) {
              const baseFileName = removeExtension(name)
              if (baseFileName.endsWith('.wxs')) {
                return path.normalize((baseFileName))
              }
              return path.normalize(addExtension(baseFileName, '.js'))
            }
            return path.normalize(name)
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

export async function runDev(ctx: Context, options?: UserConfig) {
  process.env.NODE_ENV = 'development'
  const watcher = (await build(
    defu<UserConfig, UserConfig[]>(
      options,
      await getDefaultConfig(ctx),
      {
        mode: 'development',
        build: {
          watch: {

          },
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

export async function runProd(ctx: Context, options?: UserConfig) {
  const output = (await build(
    defu<UserConfig, UserConfig[]>(
      options,
      // {
      //   build: {
      //     emptyOutDir: true,
      //   },
      // },
      await getDefaultConfig(ctx),
      {
        mode: 'production',
      },
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
