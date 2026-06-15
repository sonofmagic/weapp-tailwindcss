import { describe, expect, it } from 'vitest'
import tsconfigBuild from '../../tsconfig.build.json' with { type: 'json' }
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
    expect(runtimeConfig.entry).toHaveProperty('framework')
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

  it('bundles uni-app x template compiler deps while keeping shared runtime deps external', () => {
    const configs = createTsdownConfigs()
    const runtimeConfig = configs[0]
    const alwaysBundle = runtimeConfig.deps?.alwaysBundle
    const neverBundle = runtimeConfig.deps?.neverBundle

    expect(typeof alwaysBundle).toBe('function')
    expect(typeof neverBundle).toBe('function')

    expect(alwaysBundle?.('@vue/compiler-dom', undefined)).toBe(true)
    expect(alwaysBundle?.('@vue/shared', undefined)).toBe(true)
    expect(neverBundle?.('@vue/compiler-dom')).toBe(false)
    expect(neverBundle?.('postcss')).toBe(true)
    expect(neverBundle?.('webpack')).toBe(true)
    expect(runtimeConfig.deps?.onlyBundle).toBe(false)
  })

  it('keeps declaration builds from emitting workspace dependency dts into source folders', () => {
    const paths = tsconfigBuild.compilerOptions.paths

    expect(paths).toEqual({
      '@/*': ['./src/*'],
    })
    expect(Object.keys(paths)).not.toContain('@weapp-tailwindcss/logger')
    expect(Object.values(paths).flat()).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\.\.\/(?:logger|postcss|reset|shared)\/src/),
      ]),
    )
  })
})
