import process from 'node:process'
import type { InlineConfig } from 'vite'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import { vitePluginWeapp } from './plugins'

export function getDefaultConfig(): InlineConfig {
  return {
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name.endsWith('.ts')) {
              return addExtension(removeExtension(chunkInfo.name), '.js')
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
      vitePluginWeapp(),
    ],
  }
}

export async function runDev(options?: InlineConfig) {
  process.env.NODE_ENV = 'development'
  const watcher = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      getDefaultConfig(),
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

  // watcher.on('event', (event) => {
  //   console.log(event)
  // })

  return watcher
}

export async function runProd(options?: InlineConfig) {
  const output = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      getDefaultConfig(),
      {
        mode: 'production',
      },
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
