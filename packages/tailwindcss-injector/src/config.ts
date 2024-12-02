import type { Config } from 'tailwindcss'
import path from 'node:path'
import process from 'node:process'
import { defu } from 'defu'
import { createJiti } from 'jiti'
import { lilconfig } from 'lilconfig'

const jiti = createJiti(import.meta.url)

export interface LoadTailwindcssConfigOptions {
  cwd: string
  config: string
}

const moduleName = 'tailwind'

export async function loadConfig(options?: Partial<LoadTailwindcssConfigOptions>) {
  const { config, cwd } = defu<LoadTailwindcssConfigOptions, Partial<LoadTailwindcssConfigOptions>[]>(options, {
    cwd: process.cwd(),
  })

  const searcher = lilconfig('tailwindcss', {
    searchPlaces: [
      `${moduleName}.config.js`,
      `${moduleName}.config.cjs`,
      `${moduleName}.config.mjs`,
      `${moduleName}.config.ts`,
      `${moduleName}.config.cts`,
      `${moduleName}.config.mts`,
    ],
    loaders: {
      '.js': jiti,
      '.cjs': jiti,
      '.mjs': jiti,
      '.ts': jiti,
      '.cts': jiti,
      '.mts': jiti,
    },
  })

  if (typeof config === 'string' && config) {
    const configPath = path.isAbsolute(config) ? config : path.resolve(cwd, config)
    const result = await searcher.load(configPath)
    return result?.config as Config | undefined
  }
  else {
    const result = await searcher.search(cwd)
    return result?.config as Config | undefined
  }
}
