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
  moduleName: string
}

export type LoadConfigResult = null | {
  filepath: string
  config: Config
  isEmpty?: boolean
}

export async function loadConfig(options?: Partial<LoadConfigOptions>): Promise<LoadConfigResult> {
  const { config, cwd, moduleName } = defuOverrideArray<LoadConfigOptions, Partial<LoadConfigOptions>[]>(
    options as LoadConfigOptions,
    {
      cwd: process.cwd(),
      moduleName: 'tailwind',
    },
  )

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
    return await searcher.load(configPath)
  }
  else {
    return await searcher.search(cwd)
  }
}
