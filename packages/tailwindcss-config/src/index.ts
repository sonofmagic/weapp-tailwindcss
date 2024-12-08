import type { Config } from 'tailwindcss'
import path from 'node:path'
import process from 'node:process'
import { createJiti } from 'jiti'
import { lilconfig } from 'lilconfig'
import { defuOverrideArray } from './utils'

const jiti = createJiti(import.meta.url)

export interface LoadConfigOptions {
  cwd: string
  config: string
}

const moduleName = 'tailwind'

export async function loadConfig(options?: Partial<LoadConfigOptions>) {
  const { config, cwd } = defuOverrideArray<LoadConfigOptions, Partial<LoadConfigOptions>[]>(options as LoadConfigOptions, {
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
