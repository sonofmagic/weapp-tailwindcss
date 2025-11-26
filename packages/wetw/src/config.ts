import type { ResolvedWetwConfig, WetwConfig, WetwFramework } from './types'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { loadConfig } from 'c12'
import { defaultRegistry } from './registry'

export const DEFAULT_OUT_DIR = 'wetw'
export const DEFAULT_FRAMEWORK: WetwFramework = 'mp-weixin'

export interface LoadWetwConfigOptions {
  cwd?: string
  configFile?: string
  overrides?: WetwConfig
}

export function defineConfig(config: WetwConfig) {
  return config
}

const moduleDir = dirname(fileURLToPath(new URL(import.meta.url)))

export async function loadWetwConfig(
  options: LoadWetwConfigOptions = {},
): Promise<ResolvedWetwConfig> {
  const { cwd: inputCwd, configFile, overrides } = options

  const loaded = await loadConfig<WetwConfig>({
    name: 'wetw',
    cwd: inputCwd,
    configFile,
  })

  const rawConfig = loaded.config ?? {}
  const cwd = resolve(inputCwd ?? rawConfig.cwd ?? process.cwd())

  const merged: WetwConfig = {
    outDir: DEFAULT_OUT_DIR,
    templatesRoot: resolve(moduleDir, '../templates'),
    registry: defaultRegistry,
    framework: DEFAULT_FRAMEWORK,
    ...rawConfig,
    ...overrides,
  }

  const outDir = resolve(cwd, merged.outDir ?? DEFAULT_OUT_DIR)
  const templatesRoot
    = merged.templatesRoot !== undefined
      ? resolve(cwd, merged.templatesRoot)
      : resolve(moduleDir, '../templates')

  return {
    ...merged,
    cwd,
    outDir,
    templatesRoot,
    registry: merged.registry ?? defaultRegistry,
    framework: merged.framework ?? DEFAULT_FRAMEWORK,
  }
}
