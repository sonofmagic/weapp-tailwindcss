import type { Plugin, Rule } from 'postcss'
import postcss, { AtRule, Declaration } from 'postcss'
import { describe, expect, it } from 'vitest'
import postcssHtmlTransform from '@/html-transform'
import { commonChunkPreflight, remakeCssVarSelector, testIfVariablesScope } from '@/mp'
import { createColorFunctionalFallback } from '@/plugins/colorFunctionalFallback'
import { getCustomPropertyCleaner } from '@/plugins/getCustomPropertyCleaner'
import { postcssWeappTailwindcssPostPlugin, reorderVariableDeclarations } from '@/plugins/post'
import { createRootSpecificityCleaner } from '@/plugins/post/specificity-cleaner'
import { postcssWeappTailwindcssPrePlugin } from '@/plugins/pre'
import { isNotLastChildPseudo, normalizeSpacingDeclarations } from '@/selectorParser/spacing'
import cssVarsV3 from '../src/cssVarsV3'
import * as entry from '../src/index'
import * as selectorExports from '../src/selectorParser'
import { createPlugin, createPlugins } from './plugins/utils'
import { getFixture } from './utils'

describe('entry exports', () => {
  it('loads core entry points and css vars', async () => {
    expect(Array.isArray(cssVarsV3)).toBe(true)
    expect(cssVarsV3[0]?.prop).toBe('--tw-border-spacing-x')
    expect(typeof entry.createStylePipeline).toBe('function')
    expect(typeof selectorExports.getFallbackRemove).toBe('function')
    await import('../src/types')
  })
})

describe('test helpers', () => {
  it('reads fixtures and exercises plugin utils', async () => {
    const content = await getFixture('css', 'v4.css')
    expect(content.length).toBeGreaterThan(0)

    const plugin = createPlugin('alpha')
    plugin.AtRule?.({} as any, {} as any)
    plugin.AtRuleExit?.({} as any, {} as any)
    plugin.Comment?.({} as any, {} as any)
    plugin.CommentExit?.({} as any, {} as any)
    plugin.Document?.({} as any, {} as any)
    plugin.DocumentExit?.({} as any, {} as any)

    const pluginObject = { postcssPlugin: 'beta' } as Plugin
    const merged = createPlugin(pluginObject)
    expect(merged.postcssPlugin).toBe('beta')
    expect(createPlugins(['gamma', pluginObject])).toHaveLength(2)
  })
})

describe('spacing helpers', () => {
  it('handles edge selector nodes and non-decls', () => {
    const invalidPseudo = { type: 'pseudo', value: ':not', nodes: [{ type: 'class' }] } as any
    expect(isNotLastChildPseudo(invalidPseudo)).toBe(false)

    const rule = postcss.parse('.a { /*c*/ margin-left: 1px; -webkit-margin-start: 2px }').first as Rule
    normalizeSpacingDeclarations(rule)
    expect(rule.toString()).not.toContain('-webkit-margin-start')
  })
})

describe('specificity cleaner', () => {
  it('covers empty selector lists and spaced matches', () => {
    const emptyCleaner = createRootSpecificityCleaner({
      cssSelectorReplacement: { root: [' ', ''] },
      cssPresetEnv: { features: { 'is-pseudo-class': { specificityMatchingName: 'tw' } } },
    } as any)
    expect(emptyCleaner).toBeUndefined()

    const cleaner = createRootSpecificityCleaner({
      cssSelectorReplacement: { root: ['page'] },
      cssPresetEnv: { features: { 'is-pseudo-class': { specificityMatchingName: 'tw' } } },
    } as any)
    const rule = postcss.parse('page :not(.tw) { color: red }').first as Rule
    cleaner?.(rule)
    expect(rule.selector).toBe('page')

    const emptyRule = { selectors: [] } as Rule
    cleaner?.(emptyRule)
    expect(emptyRule.selectors).toEqual([])
  })
})

describe('post plugin edge cases', () => {
  it('cleans specificity when not main chunk', async () => {
    const post = postcssWeappTailwindcssPostPlugin({
      isMainChunk: false,
      cssSelectorReplacement: { root: 'page' },
      cssPresetEnv: { features: { 'is-pseudo-class': { specificityMatchingName: 'tw' } } },
    })
    const res = await postcss([post]).process('page:not(.tw) { color: red }', { from: undefined })
    expect(res.css).toContain('page')
    expect(res.css).not.toContain(':not(.tw)')
  })

  it('skips non-declarations in dedupe flows', async () => {
    const rule = postcss.parse('.a { /*c*/ --x: 1; color: red; }').first as Rule
    reorderVariableDeclarations(rule)

    const post = postcssWeappTailwindcssPostPlugin({})
    const result = await postcss([post]).process('.a { /*c*/ margin-left: 1px; margin-inline-start: 1px; }', { from: undefined })
    expect(result.css).toContain('margin-left')
  })
})

describe('custom property cleaner', () => {
  it('keeps values without custom properties', async () => {
    const cleaner = getCustomPropertyCleaner({ cssCalc: { includeCustomProperties: ['--keep'] } } as any)
    const css = '.demo { color: red; color: blue; }'
    const result = await postcss([cleaner!]).process(css, { from: undefined })
    expect(result.css.match(/color:/g)?.length).toBe(2)
  })
})

describe('color fallback edge cases', () => {
  it('skips invalid rgb shapes', async () => {
    const plugin = createColorFunctionalFallback()
    const noColors = await postcss([plugin]).process('.a { color: rgb(/ 0.5) }', { from: undefined })
    expect(noColors.css).toContain('rgb(/ 0.5)')

    const tooFew = await postcss([plugin]).process('.b { color: rgb(1 2 / 0.5) }', { from: undefined })
    expect(tooFew.css).toContain('rgb(1 2 / 0.5)')

    const commaSeparated = await postcss([plugin]).process('.c { color: rgb(1, 2, 3 / 0.5) }', { from: undefined })
    expect(commaSeparated.css).toContain('rgba(1, 2, 3, 0.5)')

    const spaced = await postcss([plugin]).process('.d { color: rgb( 1 2 3 / 0.5 ) }', { from: undefined })
    expect(spaced.css.replace(/\s+/g, '')).toContain('rgba(1,2,3,0.5)')
  })
})

describe('pre plugin edge cases', () => {
  it('removes hover media without nodes', () => {
    const pre = postcssWeappTailwindcssPrePlugin({})
    const handler = (pre as Plugin).AtRule as ((node: AtRule) => void) | undefined
    const root = postcss.root()
    const atRule = new AtRule({ name: 'media', params: '(hover:hover)' })
    root.append(atRule)
    handler?.(atRule)
    expect(root.nodes?.length).toBe(0)
  })

  it('drops empty layer rules and tracks properties layers', () => {
    const pre = postcssWeappTailwindcssPrePlugin({})
    const handler = (pre as Plugin).AtRule as ((node: AtRule) => void) | undefined
    const root = postcss.root()
    const layer = new AtRule({ name: 'layer', params: 'utilities', nodes: [] })
    root.append(layer)
    handler?.(layer)
    expect(root.nodes?.length).toBe(0)

    const once = (pre as Plugin).Once as ((root: postcss.Root) => void) | undefined
    const propertiesRoot = postcss.parse('@layer properties {}')
    once?.(propertiesRoot)
    expect(propertiesRoot.first?.name).toBe('layer')
  })
})

describe('html transform platforms', () => {
  it('leaves quickapp selectors untouched', async () => {
    const css = 'view { color: red }'
    const result = await postcss([postcssHtmlTransform({ platform: 'quickapp' })]).process(css, { from: undefined })
    expect(result.css).toBe(css)
  })
})

describe('mp helpers', () => {
  it('injects preflight into variable scopes', () => {
    const rule = postcss.parse('::before,::after { --tw-a:1; --tw-b:2 }').first as Rule
    expect(testIfVariablesScope(rule)).toBe(true)
    const remade = remakeCssVarSelector(['.x'], { cssSelectorReplacement: { universal: ['view'] } } as any)
    expect(remade[0]).toBe('*')
    const beforeCount = rule.nodes?.length ?? 0
    const inject = () => [new Declaration({ prop: 'color', value: 'blue' })]
    commonChunkPreflight(rule, { cssInjectPreflight: inject } as any)
    expect(rule.prev()?.type).toBe('rule')
    expect(rule.nodes?.length ?? 0).toBeGreaterThan(beforeCount)
  })
})
