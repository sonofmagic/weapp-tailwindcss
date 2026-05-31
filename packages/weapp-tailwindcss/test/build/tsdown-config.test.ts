import { describe, expect, it } from 'vitest'
import {
  cliEntries,
  createTsdownConfigs,
  runtimeEntries,
} from '../../tsdown.shared.mts'

describe('tsdown build layout', () => {
  it('separates cli entry from runtime entries to avoid shared chunk pollution', () => {
    const configs = createTsdownConfigs()
    const runtimeConfig = configs[0]
    const cliConfig = configs[1]

    expect(runtimeConfig.entry).toEqual(runtimeEntries)
    expect(runtimeConfig.entry).not.toHaveProperty('cli')
    expect(runtimeConfig.entry).toHaveProperty('generator')
    expect(runtimeConfig.entry).toHaveProperty('postcss')

    expect(cliConfig.entry).toEqual(cliEntries)
    expect(Object.keys(cliConfig.entry)).toEqual(['cli'])
  })

  it('keeps runtime config as the only cleanable build during non-watch runs', () => {
    const configs = createTsdownConfigs()

    expect(configs[0].clean).toBe(true)
    expect(configs.slice(1).every(config => config.clean === false)).toBe(true)
  })

  it('disables clean across all builds in watch mode', () => {
    const configs = createTsdownConfigs({ watch: true })

    expect(configs.every(config => config.clean === false)).toBe(true)
  })

  it('bundles Vue compiler deps for runtime entries', () => {
    const configs = createTsdownConfigs()
    const runtimeConfig = configs[0]
    const alwaysBundle = runtimeConfig.deps?.alwaysBundle
    const neverBundle = runtimeConfig.deps?.neverBundle

    expect(typeof alwaysBundle).toBe('function')
    expect(typeof neverBundle).toBe('function')

    for (const id of [
      '@vue/compiler-core',
      '@vue/compiler-dom',
      '@vue/compiler-sfc',
      '@vue/compiler-ssr',
      '@vue/shared',
    ]) {
      expect(alwaysBundle?.(id)).toBe(true)
      expect(neverBundle?.(id)).toBe(false)
    }
  })
})
