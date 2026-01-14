import type { Plugin } from 'postcss'
import postcss, { Declaration, Rule } from 'postcss'
import { describe, expect, it, vi } from 'vitest'
import { normalizeTailwindcssV4Declaration } from '@/compat/tailwindcss-v4'
import { stripUnsupportedNodeForUniAppX } from '@/compat/uni-app-x'
import { fingerprintOptions } from '@/fingerprint'
import postcssHtmlTransform from '@/html-transform'
import { commonChunkPreflight, remakeCssVarSelector } from '@/mp'
import { createOptionsResolver } from '@/options-resolver'
import { createStylePipeline } from '@/pipeline'
import { createColorFunctionalFallback } from '@/plugins/colorFunctionalFallback'
import { createContext } from '@/plugins/ctx'
import { getCustomPropertyCleaner } from '@/plugins/getCustomPropertyCleaner'
import { postcssWeappTailwindcssPostPlugin, reorderVariableDeclarations } from '@/plugins/post'
import { postcssWeappTailwindcssPrePlugin } from '@/plugins/pre'
import {
  composeIsPseudoAst,
  getCombinatorSelectorAst,
  getFallbackRemove,
  isOnlyBeforeAndAfterPseudoElement,
  mklist,
  ruleTransformSync,
} from '@/selectorParser'
import { reorderLiteralFirst } from '@/utils/decl-order'
import { hasTwVars } from '@/utils/tw-vars'

describe('utility coverage helpers', () => {
  it('fingerprintOptions handles anonymous functions', () => {
    const anonResult = fingerprintOptions(() => {})
    expect(anonResult).toBe('fn:anonymous')

    const proxyFn = new Proxy(() => {}, {
      get(target, prop, receiver) {
        if (prop === 'name') {
          return ''
        }
        return Reflect.get(target, prop, receiver)
      },
    })
    expect(fingerprintOptions(proxyFn)).toBe('fn:anonymous')
  })

  it('hasTwVars handles rules without nodes', () => {
    const emptyRule = new Rule({ selector: '.foo' })
    expect(hasTwVars(emptyRule, 1)).toBe(false)
  })

  it('reorderLiteralFirst early-return paths are covered', () => {
    const literalRule = postcss.parse('.foo { color: red }').first as Rule
    const declarations = literalRule.nodes as Declaration[]
    reorderLiteralFirst(literalRule, declarations, decl => decl.value.includes('var('))
    const variablesOnly = postcss.parse('.bar { --x: 1; --y: 2 }').first as Rule
    const vars = variablesOnly.nodes as Declaration[]
    reorderLiteralFirst(variablesOnly, vars, decl => decl.value.includes('var('))
    expect(variablesOnly.toString()).toContain('--x')
  })

  it('options resolver caches by reference and fingerprint', () => {
    const baseOptions = { cssPresetEnv: { features: {}, autoprefixer: { add: false } } }
    const resolver = createOptionsResolver(baseOptions as any)
    const overrides = { cssRemoveHoverPseudoClass: true }
    const first = resolver.resolve(overrides)
    const cachedByRef = resolver.resolve(overrides)
    expect(cachedByRef).toBe(first)
    const cachedByKey = resolver.resolve({ cssRemoveHoverPseudoClass: true })
    expect(cachedByKey).toBe(first)
  })

  it('context exposes isVariablesScope utilities', () => {
    const ctx = createContext()
    const rule = new Rule({ selector: '.scope' })
    ctx.markVariablesScope(rule as any)
    expect(ctx.isVariablesScope(rule as any)).toBe(true)
  })
})

describe('html transform edge cases', () => {
  it('covers h5 selectors and cursor removal', async () => {
    const result = await postcss([
      postcssHtmlTransform({ platform: 'h5', removeCursorStyle: true }),
    ]).process('view { cursor: pointer; }', { from: undefined })
    expect(result.css).toContain('taro-view-core')
    expect(result.css).not.toContain('cursor')

    const plugin = postcssHtmlTransform({ platform: 'h5', removeCursorStyle: true }) as Plugin
    const rule = new Rule({ selector: 'view' })
    rule.append(new Declaration({ prop: 'cursor', value: 'pointer' }))
    const ruleHandler = plugin.Rule as ((node: Rule) => void) | undefined
    ruleHandler?.(rule)
    const declHandler = plugin.Declaration as ((node: Declaration) => void) | undefined
    declHandler?.(rule.first as Declaration)
    expect(rule.selector).toBe('taro-view-core')
    expect((rule.nodes as Declaration[]).length).toBe(0)
  })

  it('skips work when platform has no walker', async () => {
    const css = '.foo { color: red }'
    const output = await postcss([postcssHtmlTransform({ platform: 'rn' })]).process(css, { from: undefined })
    expect(output.css).toBe(css)
  })
})

describe('mp helpers', () => {
  it('remakes css var selectors with all cases', () => {
    const baseSelectors = ['.foo']
    const withAll = remakeCssVarSelector([...baseSelectors], { cssPreflightRange: 'all' } as any)
    expect(withAll).toContain(':not(not)')

    const withArrayUniversal = remakeCssVarSelector([...baseSelectors], {
      cssSelectorReplacement: { universal: ['view', 'text'] },
    } as any)
    expect(withArrayUniversal[0]).toBe('*')

    const withStringUniversal = remakeCssVarSelector([...baseSelectors], {
      cssSelectorReplacement: { universal: 'view' },
    } as any)
    expect(withStringUniversal[0]).toBe('*')
  })

  it('injects preflight chunks and additional scopes', () => {
    const beforeAfterRule = postcss.parse('::before,::after { --tw-a:1; --tw-b:2 }').first as Rule
    const inject = () => [new Declaration({ prop: 'color', value: 'blue' })]
    commonChunkPreflight(beforeAfterRule, { cssInjectPreflight: inject } as any)
    expect(isOnlyBeforeAndAfterPseudoElement(beforeAfterRule)).toBe(true)

    const backdropRule = postcss.parse('::backdrop { --tw-a:1; --tw-b:2 }').first as Rule
    commonChunkPreflight(backdropRule, {
      injectAdditionalCssVarScope: true,
      cssInjectPreflight: inject,
    } as any)
    expect(backdropRule.prev()).toBeTruthy()
  })
})

describe('compat helpers', () => {
  it('clamps non-finite radii in v4 normalizer', () => {
    const decl = new Declaration({ prop: 'border-radius', value: '1e309px' })
    const changed = normalizeTailwindcssV4Declaration(decl)
    expect(changed).toBe(true)
    expect(decl.value).toBe('9999px')
  })

  it('handles uni-app-x unsupported nodes', () => {
    const removed = stripUnsupportedNodeForUniAppX({ type: 'tag', value: 'view', remove: vi.fn() } as any, { uniAppX: true })
    expect(removed).toBe(true)
    const untouched = stripUnsupportedNodeForUniAppX({ type: 'class', value: 'x' } as any, { uniAppX: true })
    expect(untouched).toBe(false)
  })
})

describe('plugin behaviours', () => {
  it('color functional fallback converts modern rgb', async () => {
    const res = await postcss([createColorFunctionalFallback()]).process('.foo { color: rgb(1 2 3 / 0.5) }', { from: undefined })
    expect(res.css).toContain('rgba(1, 2, 3, 0.5)')

    const unchanged = await postcss([createColorFunctionalFallback()]).process('.bar { color: rgb(1, 2, 3) }', { from: undefined })
    expect(unchanged.css).toContain('rgb(1, 2, 3)')
  })

  it('custom property cleaner removes duplicates and matched vars', async () => {
    const cleaner = getCustomPropertyCleaner({ cssCalc: { includeCustomProperties: ['--keep'] } } as any)
    expect(cleaner).toBeTruthy()
    const css = `
      .demo {
        color: red;
        color: red;
        color: var(--keep);
        color: var(--other);
      }
    `
    const result = await postcss([cleaner!]).process(css, { from: undefined })
    expect(result.css).not.toContain('var(--keep)')
    expect(result.css.match(/color:/g)?.length).toBe(2)

    expect(getCustomPropertyCleaner({ cssCalc: false } as any)).toBeNull()
  })

  it('pre plugin removes hover media and empty layers', async () => {
    const pre = postcssWeappTailwindcssPrePlugin({})
    const result = await postcss([pre]).process('@media(hover:hover){} @layer empty {}', { from: undefined })
    expect(result.css).toBe('')

    const supports = await postcss([pre]).process('@supports (color-mix(in srgb, red 50%, blue 50%)) { a { color:red } }', { from: undefined })
    expect(supports.css).toBe('')
  })

  it('post plugin cleans specificity wrappers and removes empty rules', async () => {
    const post = postcssWeappTailwindcssPostPlugin({
      cssSelectorReplacement: { root: ['page'] },
      cssRemoveProperty: true,
      cssPresetEnv: {
        features: {
          'is-pseudo-class': {
            specificityMatchingName: 'tw',
          },
        },
      },
    })
    const css = `
      page:not(.tw){ color:red }
      .space{ margin-left:1px; margin-left:1px; margin-left:var(--v); }
      @property --foo {}
    `
    const res = await postcss([post]).process(css, { from: undefined })
    expect(res.css).not.toContain('property')
    expect(res.css).toContain('page')
  })

  it('reorders variable declarations directly', () => {
    const rule = postcss.parse('.a { margin-left: var(--v); margin-left: 2px; margin-left: 1px; }').first as Rule
    reorderVariableDeclarations(rule)
    const order = (rule.nodes as Declaration[]).map(d => d.value)
    expect(order.at(-1)).toBe('var(--v)')
  })
})

describe('selector parser coverage', () => {
  it('composeIsPseudoAst covers string and array paths', () => {
    const stringAst = composeIsPseudoAst('view')
    const arrayAst = composeIsPseudoAst(['view'])
    expect(stringAst[0].type).toBe('tag')
    expect(arrayAst[0].type).toBe('tag')
  })

  it('fallback remover handles universals, empty where and direct transformSync calls', async () => {
    const fallback = getFallbackRemove(undefined, {})
    const parsed = await fallback.process('*:where([hidden]):not(#) {}')
    const output = typeof parsed === 'string' ? parsed : (parsed as { css: string }).css
    expect(output).not.toContain('*')

    const rule = postcss.parse(':where([hidden]){}').first as Rule
    fallback.transformSync(rule)
    expect(rule.selector).toBe('')
  })

  it('fallback transformSync handles string input', () => {
    const fallback = getFallbackRemove(undefined, {})
    const result = fallback.transformSync('a :where(.b)')
    expect(result).toBeUndefined()
  })

  it('rule transformer normalizes spacing and hover removals', () => {
    const options = {
      cssSelectorReplacement: { universal: ['view'], root: ['page'] },
      cssRemoveHoverPseudoClass: true,
      uniAppX: true,
      cssChildCombinatorReplaceValue: ['view'],
    }
    const root = postcss.parse(`
      .space-x-4 > :not(:last-child) { margin-top:1px; margin-top:1px; margin-top: var(--v); -webkit-margin-before:2px; }
      .hover\\:test:hover { color:red }
      :root { padding-inline-start:1px; }
    `)
    root.walkRules(rule => ruleTransformSync(rule, options as any))
    expect(root.toString()).not.toContain('-webkit-margin-before')
  })

  it('mklist and combinator helpers run through getCombinatorSelectorAst', () => {
    const combinatorAst = getCombinatorSelectorAst({ cssChildCombinatorReplaceValue: ['view'] } as any)
    expect(combinatorAst.length).toBe(3)
    const cloned = mklist(combinatorAst[0])
    expect(cloned[2]).toBeDefined()
  })
})

describe('pipeline edge cases', () => {
  const baseOptions = {
    cssPresetEnv: { features: {}, autoprefixer: { add: false } },
    cssCalc: false,
    px2rpx: false,
    rem2rpx: false,
  }

  it('normalizes user plugins defined as object', () => {
    const pipeline = createStylePipeline({
      ...baseOptions,
      postcssOptions: {
        plugins: {
          alpha: { postcssPlugin: 'alpha' },
        },
      },
    } as any)
    expect(pipeline.nodes[0]?.id).toBe('pre:user-0')
  })

  it('ignores invalid plugin definitions', () => {
    const pipeline = createStylePipeline({
      ...baseOptions,
      postcssOptions: {
        plugins: 'invalid',
      },
    } as any)
    expect(pipeline.nodes[0]?.id).toBe('pre:core')
  })
})
