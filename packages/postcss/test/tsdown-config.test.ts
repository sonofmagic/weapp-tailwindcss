import { describe, expect, it } from 'vitest'
import {
  createPostcssTsdownConfigs,
  postcssEsmOnlyDependencies,
} from '../tsdown.config.mts'

function matchesDependency(patterns: Array<RegExp | string>, id: string) {
  return patterns.some(pattern => typeof pattern === 'string' ? pattern === id : pattern.test(id))
}

describe('postcss tsdown config', () => {
  it('externalizes ESM dependencies and bundles synchronous ESM-only CJS dependencies', () => {
    const [esm, cjs] = createPostcssTsdownConfigs()

    expect(esm.format).toEqual(['esm'])
    expect(esm.clean).toBe(true)
    expect(esm.dts).toBe(false)
    expect(esm.deps?.neverBundle).toBe(postcssEsmOnlyDependencies)
    expect(cjs.format).toEqual(['cjs'])
    expect(cjs.clean).toBe(false)
    expect(cjs.dts).toBe(false)
    expect(cjs.deps?.alwaysBundle).toBe(postcssEsmOnlyDependencies)
    expect(matchesDependency(postcssEsmOnlyDependencies, '@csstools/css-color-parser')).toBe(true)
    expect(matchesDependency(postcssEsmOnlyDependencies, 'postcss-preset-env')).toBe(true)
  })

  it('emits .js/.cjs and disables clean while watching', () => {
    const [esm] = createPostcssTsdownConfigs()

    expect(esm.outExtensions?.({ format: 'es' } as never).js).toBe('.js')
    expect(esm.outExtensions?.({ format: 'cjs' } as never).js).toBe('.cjs')
    expect(createPostcssTsdownConfigs({ watch: true }).every(config => config.clean === false)).toBe(true)
  })
})
