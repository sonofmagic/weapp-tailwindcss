import type { InlineConfig } from 'vite'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { defu } from '@weapp-core/shared'
import { vitePluginWeapp } from './plugins'

export function getDefaultConfig(): InlineConfig {
  return {
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
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
  const watcher = (await build(
    defu<InlineConfig, InlineConfig[]>(
      options,
      getDefaultConfig(),
      {
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
    ),
  )) as RollupOutput | RollupOutput[]

  return output
}
