import { createRootSpecificityReplacer, prepareStyleOptions } from '../src/lightningcss/options'
import { buildChildCombinatorReplacement, createVisitor } from '../src/lightningcss/selector-transform'

describe('lightningcss style handler options', () => {
  it('prepares default options and preserves custom-properties when cssCalc is enabled', () => {
    const options = prepareStyleOptions({
      cssCalc: {
        includeCustomProperties: ['--spacing'],
      },
      cssPreflight: {
        boxSizing: 'border-box',
      },
    })

    expect(options.cssRemoveProperty).toBe(true)
    expect(options.cssRemoveHoverPseudoClass).toBe(true)
    expect(options.cssPresetEnv?.features?.['custom-properties']).toEqual({
      preserve: true,
    })
    expect(options.cssInjectPreflight?.()).toEqual([
      {
        prop: 'boxSizing',
        value: 'border-box',
      },
    ])
  })

  it('preserves explicit custom-properties feature and array overrides', () => {
    const options = prepareStyleOptions({
      cssPresetEnv: {
        features: {
          'custom-properties': { preserve: false },
        },
      },
      cssSelectorReplacement: {
        root: ['custom-page'],
      },
    })

    expect(options.cssPresetEnv?.features?.['custom-properties']).toEqual({ preserve: false })
    expect(options.cssSelectorReplacement?.root).toEqual(['custom-page'])
  })

  it('creates root specificity replacers for fallback placeholders and specificity wrappers', () => {
    const fallbackOnly = createRootSpecificityReplacer({})
    expect(fallbackOnly('page:not(#n),view:not(#\\#){color:red}')).toBe('page,view{color:red}')

    const replacer = createRootSpecificityReplacer({
      cssPresetEnv: {
        features: {
          'is-pseudo-class': {
            specificityMatchingName: 'tw',
          },
        },
      },
      cssSelectorReplacement: {
        root: ['page', ' .tw-root ', '', false as unknown as string],
      },
    } as any)

    expect(replacer?.('page:not(.tw),.tw-root :not(.tw),view{color:red}')).toBe('page,.tw-root,view{color:red}')
  })

  it('returns undefined when specificity replacement has no usable selectors', () => {
    expect(createRootSpecificityReplacer({
      cssPresetEnv: {
        features: {
          'is-pseudo-class': {
            specificityMatchingName: 'tw',
          },
        },
      },
      cssSelectorReplacement: {
        root: [' ', ''],
      },
    } as any)).toBeUndefined()
  })

  it('builds child combinator replacements from string and array options', () => {
    expect(buildChildCombinatorReplacement({} as any)).toBeUndefined()
    expect(buildChildCombinatorReplacement({ cssChildCombinatorReplaceValue: [] } as any)).toBeUndefined()

    expect(buildChildCombinatorReplacement({ cssChildCombinatorReplaceValue: 'view' } as any)).toEqual([
      { type: 'type', name: 'view' },
      { type: 'combinator', value: 'next-sibling' },
      { type: 'type', name: 'view' },
    ])

    expect(buildChildCombinatorReplacement({ cssChildCombinatorReplaceValue: ['view', 'text'] } as any)).toEqual([
      {
        type: 'pseudo-class',
        kind: 'is',
        selectors: [[{ type: 'type', name: 'view' }], [{ type: 'type', name: 'text' }]],
      },
      { type: 'combinator', value: 'next-sibling' },
      {
        type: 'pseudo-class',
        kind: 'is',
        selectors: [[{ type: 'type', name: 'view' }], [{ type: 'type', name: 'text' }]],
      },
    ])
  })

  it('covers visitor rule and exit branches', () => {
    const visitor = createVisitor({
      options: {
        cssRemoveProperty: true,
        cssSelectorReplacement: {
          root: 'page',
          universal: 'view',
        },
        cssRemoveHoverPseudoClass: true,
      } as any,
    })

    expect(visitor.Rule?.({ type: 'property' } as any)).toEqual([])
    const mediaRule = { type: 'media' }
    expect(visitor.Rule?.(mediaRule as any)).toBe(mediaRule)

    const withoutSelectors = { type: 'style', value: {} }
    expect(visitor.Rule?.(withoutSelectors as any)).toBe(withoutSelectors)

    expect(visitor.Rule?.({
      type: 'style',
      value: {
        selectors: [[{ type: 'pseudo-class', kind: 'hover' }]],
      },
    } as any)).toEqual([])

    const styleRule = {
      type: 'style',
      value: {
        selectors: [[
          { type: 'pseudo-class', kind: 'root' },
          { type: 'combinator', value: 'child' },
          { type: 'universal' },
        ]],
      },
    }
    expect(visitor.Rule?.(styleRule as any)).toBe(styleRule)
    expect(styleRule.value.selectors).toEqual([[
      { type: 'type', name: 'page' },
      { type: 'combinator', value: 'child' },
      { type: 'type', name: 'view' },
    ]])

    expect(visitor.RuleExit?.({ type: 'media' } as any)).toEqual({ type: 'media' })
    expect(visitor.RuleExit?.({ type: 'style', value: { selectors: [] } } as any)).toEqual([])
    expect(visitor.RuleExit?.({
      type: 'style',
      value: {
        selectors: [[{ type: 'class', name: 'foo' }]],
        declarations: {
          declarations: [],
        },
      },
    } as any)).toEqual({
      type: 'style',
      value: {
        selectors: [[{ type: 'class', name: 'foo' }]],
        declarations: {
          declarations: [],
        },
      },
    })
  })

  it('drops empty uni-app-x style rules on exit', () => {
    const visitor = createVisitor({
      options: {
        uniAppX: true,
      } as any,
    })

    expect(visitor.RuleExit?.({
      type: 'style',
      value: {
        selectors: [[{ type: 'class', name: 'foo' }]],
        declarations: {
          declarations: [],
        },
      },
    } as any)).toEqual([])
  })

  it('transforms nested selectors and uni-app-x selector nodes', () => {
    const visitor = createVisitor({
      options: {
        uniAppX: true,
        cssSelectorReplacement: {},
      } as any,
    })
    const rule = {
      type: 'style',
      value: {
        selectors: [[
          { type: 'type', name: 'view' },
          { type: 'attribute', name: 'hidden' },
          {
            type: 'pseudo-class',
            kind: 'where',
            selectors: [[
              { type: 'class', name: 'text-[12px]' },
              { type: 'type', name: 'text' },
            ]],
          },
        ]],
      },
    }

    expect(visitor.Rule?.(rule as any)).toBe(rule)
    expect(rule.value.selectors).toEqual([[
      {
        type: 'pseudo-class',
        kind: 'is',
        selectors: [[
          { type: 'class', name: 'text-_b12px_B' },
        ]],
      },
    ]])
  })

  it('keeps supported pseudo and pseudo-element selectors when no removal is requested', () => {
    const visitor = createVisitor({
      options: {
        cssRemoveHoverPseudoClass: false,
      } as any,
    })
    const rule = {
      type: 'style',
      value: {
        selectors: [[
          { type: 'class', name: 'hover:text-[12px]' },
          { type: 'pseudo-class', kind: 'hover' },
          { type: 'pseudo-element', kind: 'before' },
        ]],
      },
    }

    expect(visitor.Rule?.(rule as any)).toBe(rule)
    expect(rule.value.selectors).toEqual([[
      { type: 'class', name: 'hover_ctext-_b12px_B' },
      { type: 'pseudo-class', kind: 'hover' },
      { type: 'pseudo-element', kind: 'before' },
    ]])
  })

  it('keeps plain selector nodes when platform replacement does not apply', () => {
    const visitor = createVisitor({
      options: {
        cssSelectorReplacement: {},
      } as any,
    })
    const rule = {
      type: 'style',
      value: {
        selectors: [[
          { type: 'type', name: 'view' },
          { type: 'attribute', name: 'data-state', operation: { operator: 'equal', value: 'open' } },
        ]],
      },
    }

    expect(visitor.Rule?.(rule as any)).toBe(rule)
    expect(rule.value.selectors).toEqual([[
      { type: 'type', name: 'view' },
      { type: 'attribute', name: 'data-state', operation: { operator: 'equal', value: 'open' } },
    ]])
  })
})
