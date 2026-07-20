import { describe, expect, it } from 'vitest'
import tsconfigBuild from '../../tsconfig.build.json' with { type: 'json' }
import {
  bundleCjsRuntimeDeps,
  cliEntries,
  createTsdownConfigs,
  externalizeEsmRuntimeDeps,
  moduleOutExtensions,
  runtimeEntries,
} from '../../tsdown.shared.mts'

describe('tsdown build layout', () => {
  it('separates cli entry from runtime entries to avoid shared chunk pollution', () => {
    const configs = createTsdownConfigs()
    const runtimeEsmConfig = configs[0]
    const runtimeCjsConfig = configs[1]
    const cliEsmConfig = configs[2]
    const cliCjsConfig = configs[3]

    expect(runtimeEsmConfig.entry).toEqual(runtimeEntries)
    expect(runtimeCjsConfig.entry).toEqual(runtimeEntries)
    expect(runtimeEsmConfig.entry).not.toHaveProperty('cli')
    expect(runtimeEsmConfig.entry).toHaveProperty('framework')
    expect(runtimeEsmConfig.entry).toHaveProperty('generator')
    expect(runtimeEsmConfig.entry).toHaveProperty('postcss')

    expect(cliEsmConfig.entry).toEqual(cliEntries)
    expect(cliCjsConfig.entry).toEqual(cliEntries)
    expect(Object.keys(cliEsmConfig.entry)).toEqual(['cli'])
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

  it('uses module-safe extensions and keeps webpack loaders as physical cjs files', () => {
    const configs = createTsdownConfigs()
    const loaderConfig = configs[5]

    expect(configs[0].format).toEqual(['esm'])
    expect(configs[1].format).toEqual(['cjs'])
    expect(configs[2].format).toEqual(['esm'])
    expect(configs[3].format).toEqual(['cjs'])
    expect(loaderConfig.format).toEqual(['cjs'])
    expect(loaderConfig.deps?.alwaysBundle).toBe(bundleCjsRuntimeDeps)
    expect(moduleOutExtensions({ format: 'es' }).js).toBe('.js')
    expect(moduleOutExtensions({ format: 'cjs' }).js).toBe('.cjs')
  })

  it('externalizes ESM dependencies and only bundles ESM-only graphs into CJS', () => {
    const configs = createTsdownConfigs()
    const runtimeEsmConfig = configs[0]
    const runtimeCjsConfig = configs[1]
    const esmNeverBundle = runtimeEsmConfig.deps?.neverBundle
    const cjsAlwaysBundle = runtimeCjsConfig.deps?.alwaysBundle
    const cjsNeverBundle = runtimeCjsConfig.deps?.neverBundle

    expect(typeof esmNeverBundle).toBe('function')
    expect(typeof cjsAlwaysBundle).toBe('function')
    expect(typeof cjsNeverBundle).toBe('function')

    expect(bundleCjsRuntimeDeps('@babel/parser')).toBe(true)
    expect(bundleCjsRuntimeDeps('@babel/traverse')).toBe(true)
    expect(bundleCjsRuntimeDeps('obug')).toBe(true)
    expect(bundleCjsRuntimeDeps('htmlparser2')).toBe(true)
    expect(bundleCjsRuntimeDeps('magic-string')).toBe(true)
    expect(bundleCjsRuntimeDeps('@vue/compiler-dom')).toBe(false)
    expect(externalizeEsmRuntimeDeps('@vue/compiler-dom')).toBe(true)
    expect(esmNeverBundle?.('@babel/types')).toBe(true)
    expect(cjsAlwaysBundle?.('@babel/types', undefined)).toBe(true)
    expect(cjsAlwaysBundle?.('htmlparser2', undefined)).toBe(true)
    expect(cjsAlwaysBundle?.('magic-string', undefined)).toBe(true)
    expect(cjsAlwaysBundle?.('@vue/compiler-dom', undefined)).toBe(false)
    expect(cjsNeverBundle?.('@vue/compiler-dom')).toBe(true)
    expect(cjsNeverBundle?.('postcss')).toBe(true)
    expect(cjsNeverBundle?.('webpack')).toBe(true)
    expect(runtimeCjsConfig.deps?.onlyBundle).toBe(false)
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
