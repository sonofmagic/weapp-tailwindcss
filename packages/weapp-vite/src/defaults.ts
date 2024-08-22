import { addExtension, removeExtension } from '@weapp-core/shared'
import { readPackageJSON } from 'pkg-types'
import path from 'pathe'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { UserConfig, WatchOptions } from './types'
import { vitePluginWeapp } from './plugins'
import type { Context } from './context'

export const defaultExcluded: string[] = ['**/node_modules/**', '**/miniprogram_npm/**']

export function getWeappWatchOptions(): WatchOptions {
  return {
    paths: ['**/*.{wxml,json,wxs}', '**/*.{png,jpg,jpeg,gif,svg,webp}', '.env', '.env.*'],
    ignored: [
      ...defaultExcluded,
    ],
  }
}

export async function getDefaultViteConfig(ctx: Context): Promise<UserConfig> {
  const localPackageJson = await readPackageJSON()
  const external: string[] = []
  if (localPackageJson.dependencies) {
    external.push(...Object.keys(localPackageJson.dependencies))
  }

  return {
    mode: ctx.options.mode,
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          strict: false,
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
    },
    plugins: [
      vitePluginWeapp(ctx),
      tsconfigPaths(),
    ],
  }
}
