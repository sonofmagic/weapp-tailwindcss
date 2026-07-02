import type { Rule } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import postcss from 'postcss'
import psp from 'postcss-selector-parser'
import { getFallbackRemove, ruleTransformSync } from '@/selectorParser'
import {
  handleClassNode,
  handleCombinatorNode,
  handleSelectorNode,
  handleUniversalNode,
} from '@/selectorParser/rule-transformer/nodes'
import {
  handlePseudoNode,
  shouldRemoveEmptyFunctionalPseudo,
  shouldRemoveUnsupportedPseudoElementSelector,
} from '@/selectorParser/rule-transformer/pseudos'

describe('selectorParser', () => {
  it('fallbackRemove case 0', async () => {
    const x = await getFallbackRemove().process('#app-provider :is(.space-x-4>view+view)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 1', async () => {
    const x = await getFallbackRemove().process('#app :is(.space-x-0>view+view)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 2', async () => {
    const x = await getFallbackRemove().process('button:not(n),input:where(,,):not(n)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 3', async () => {
    const x = await getFallbackRemove().process('[hidden]:where(:not([hidden="until-found"])):not(n):not(n):not(n)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 4', async () => {
    const x = await getFallbackRemove().process('button:not(n),input:where():not(n)')
    expect(x).toMatchSnapshot()
  })

  it('ruleTransformSync case 0', async () => {
    const target = psp((selectors) => {
      selectors.walkTags((tag) => {
        tag.remove()
      })
    })
    const normalized = await target.process('.dark view.darkcbg-black,.dark text.darkcbg-black', { updateSelector: true })
    expect(normalized).toMatchSnapshot()
  })

  it('fallbackRemove transformSync normalizes options for rule input', () => {
    const fallback = getFallbackRemove(undefined, {} as IStyleHandlerOptions)
    const root = postcss.parse('#app :is(.space-x-4>view+view){}')
    const rule = root.first as Rule
    fallback.transformSync(rule)
    expect(rule.toString()).toMatchSnapshot()
  })

  it('fallbackRemove handles empty rule selectors and string input transforms', () => {
    const fallback = getFallbackRemove(undefined, { uniAppX: true } as IStyleHandlerOptions)
    const emptyRule = postcss.rule({ selector: '' })
    fallback.transformSync(emptyRule)
    expect(emptyRule.selector).toBe('')

    const transformed = fallback.processSync('.a:where(){color:red}')
    expect(transformed).toContain('.a')
  })

  it('fallbackRemove caches keep, update and remove results for repeated rule selectors', () => {
    const fallback = getFallbackRemove(undefined, {} as IStyleHandlerOptions)

    const keepRule = postcss.parse('.keep{}').first as Rule
    fallback.transformSync(keepRule)
    expect(keepRule.selector).toBe('.keep')
    const cachedKeepRule = postcss.parse('.keep{}').first as Rule
    fallback.transformSync(cachedKeepRule)
    expect(cachedKeepRule.selector).toBe('.keep')

    const updateRule = postcss.parse('#app :is(.space-x-4>view+view){}').first as Rule
    fallback.transformSync(updateRule)
    expect(updateRule.selector).toBe('#app .space-x-4>view+view')
    const cachedUpdateRule = postcss.parse('#app :is(.space-x-4>view+view){}').first as Rule
    fallback.transformSync(cachedUpdateRule)
    expect(cachedUpdateRule.selector).toBe('#app .space-x-4>view+view')

    const removeRoot = postcss.parse('[hidden]{}')
    const removeRule = removeRoot.first as Rule
    fallback.transformSync(removeRule)
    expect(removeRule.parent).toBeUndefined()
    const cachedRemoveRoot = postcss.parse('[hidden]{}')
    const cachedRemoveRule = cachedRemoveRoot.first as Rule
    fallback.transformSync(cachedRemoveRule)
    expect(cachedRemoveRule.parent).toBeUndefined()
  })

  it('ruleTransformSync caches parser per options instance', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        universal: ['view', 'text'],
      },
    }
    const firstRoot = postcss.parse('.foo *{}')
    const firstRule = firstRoot.first as Rule
    ruleTransformSync(firstRule, options)
    expect(firstRule.toString()).toMatchSnapshot()

    const secondRoot = postcss.parse('.bar :where(.buzz > :not(:last-child)){}')
    const secondRule = secondRoot.first as Rule
    ruleTransformSync(secondRule, options)
    expect(secondRule.toString()).toMatchSnapshot()
  })

  it('ruleTransformSync covers fast path cache, empty selectors, and child combinator template fallbacks', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        universal: ['view', 'text'],
      },
      cssChildCombinatorReplaceValue: ['view', 'text'],
    }
    const fastRule = postcss.parse('.foo .bar{}').first as Rule
    ruleTransformSync(fastRule, options)
    expect(fastRule.selector).toBe('.foo .bar')

    const cachedFastRule = postcss.parse('.foo .bar{}').first as Rule
    ruleTransformSync(cachedFastRule, options)
    expect(cachedFastRule.selector).toBe('.foo .bar')

    const emptyRule = postcss.rule({ selector: '' })
    ruleTransformSync(emptyRule, options)
    expect(emptyRule.selector).toBe('')

    const hiddenRoot = postcss.parse('.space-y-2 > :not(template) ~ :not([hidden]){margin-top:1px;margin-top:var(--v)}')
    const hiddenRule = hiddenRoot.first as Rule
    ruleTransformSync(hiddenRule, options)
    expect(hiddenRule.selector).toContain('.space-y-2>:is(view,text)+:is(view,text)')
    expect(hiddenRule.toString()).toContain('margin-top:var(--v)')
  })

  it('ruleTransformSync rewrites root and universal selectors with custom escape map', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        root: ['page', '.tw-root'],
        universal: ['view'],
      },
      escapeMap: {
        ':': '_c_',
      } as any,
    }
    const root = postcss.parse(':root *,.hover\\:bg:hover{color:red}')
    const rule = root.first as Rule
    ruleTransformSync(rule, options)
    const transformed = root.toString()

    expect(transformed).toContain(':is(page,.tw-root) view')
    expect(transformed).toContain('.hover_c_bg:hover')
  })

  it('ruleTransformSync expands where pseudo branches to mini-program selectors', () => {
    const root = postcss.parse('.theme-dark :where(.dark\\:bg-black,.dark\\:text-white){color:red;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    expect(rule.toString()).toMatchSnapshot()
  })

  it.each([
    [
      'tailwind class dark selector',
      '.dark\\:bg-black:where(.dark, .dark *){color:red;}',
      ['.dark_cbg-black.dark', '.dark_cbg-black.dark *'],
      [':where('],
    ],
    [
      'tailwind attribute dark selector',
      '.dark\\:bg-black:where([data-mode="dark"], [data-mode="dark"] *){color:red;}',
      ['.dark_cbg-black[data-mode="dark"]', '.dark_cbg-black[data-mode="dark"] *'],
      [':where('],
    ],
    [
      'tailwind v4 space child selector',
      ':where(.space-y-2 > :not(:last-child)){margin-top:1px;margin-bottom:2px;}',
      ['.space-y-2>:is(view,text)+:is(view,text)'],
      [':where(', ':not('],
    ],
    [
      'tailwind v4 divide child selector',
      ':where(.divide-x-4 > :not(:last-child)){border-left-width:4px;}',
      ['.divide-x-4>:is(view,text)+:is(view,text)'],
      [':where(', ':not('],
    ],
    [
      'tailwind v4 button type preflight selector',
      'button,input:where([type="button"], [type="reset"], [type="submit"]){appearance:button;}',
      ['input[type="button"]', 'input[type="reset"]', 'input[type="submit"]'],
      [':where('],
    ],
    [
      'tailwind v4 nested select preflight selector',
      ':where(select:is([multiple], [size])) optgroup{font-weight:700;}',
      ['select[multiple] optgroup', 'select[size] optgroup'],
      [':where(', ':is('],
    ],
    [
      'tailwind v4 nested select option preflight selector',
      ':where(select:is([multiple], [size])) optgroup option{padding-inline-start:20px;}',
      ['select[multiple] optgroup option', 'select[size] optgroup option'],
      [':where(', ':is('],
    ],
    [
      'nested where selector with comma inside branch',
      '.scope :where(:where(.alpha, .beta) > .target){color:green;}',
      ['.scope .alpha>.target', '.scope .beta>.target'],
      [':where('],
    ],
    [
      'child plugin selector',
      ':where(.child\\:ring-white) > :where(:not(.not-child)){box-shadow:0 0 #fff;}',
      ['.child\\:ring-white'],
      [':where('],
    ],
  ])('ruleTransformSync covers %s', (_name, source, includes, excludes) => {
    const root = postcss.parse(source)
    root.walkRules(rule => ruleTransformSync(rule, {
      cssChildCombinatorReplaceValue: ['view', 'text'],
    }))
    const transformed = root.toString()
    for (const expected of includes) {
      expect(transformed).toContain(expected)
    }
    for (const unexpected of excludes) {
      expect(transformed).not.toContain(unexpected)
    }
  })

  it('ruleTransformSync strips unsupported rtl language pseudo selectors', () => {
    const root = postcss.parse('.space-x-2\\.5>view+view:not(:-webkit-any(:lang(ar),:lang(he))),.space-x-2\\.5>view+view:not(:-moz-any(:lang(ar),:lang(he))),.space-x-2\\.5>view+view:-webkit-any(:lang(ar),:lang(he)),.space-x-2\\.5>view+view:-moz-any(:lang(ar),:lang(he)){margin-right:1px;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).toContain('.space-x-2_d5>view+view')
    expect(transformed).not.toContain(':-webkit-any')
    expect(transformed).not.toContain(':-moz-any')
    expect(transformed).not.toContain(':lang(')
  })

  it('ruleTransformSync keeps before after pseudo elements and removes unsupported pseudo elements', () => {
    const root = postcss.parse('::before,::after,::backdrop,::-webkit-backdrop,::-ms-backdrop{--tw-content:"";}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).toContain('before')
    expect(transformed).toContain('after')
    expect(transformed).not.toContain('backdrop')
  })

  it('ruleTransformSync removes pure backdrop pseudo element rules', () => {
    const root = postcss.parse('::-webkit-backdrop,::-ms-backdrop,::backdrop{box-sizing:border-box;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    expect(rule.parent).toBeUndefined()
  })

  it('ruleTransformSync removes file selector button pseudo element', () => {
    const root = postcss.parse('.a::file-selector-button,.b{color:red;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).not.toContain('file-selector-button')
    expect(transformed).toContain('.b')
  })

  it('ruleTransformSync covers root, universal, empty pseudo, and uni-app-x pseudo branches', () => {
    const rootReplacement = postcss.parse(':root *,.a:not(){color:red;}')
    const rootRule = rootReplacement.first as Rule
    ruleTransformSync(rootRule, {
      cssSelectorReplacement: {
        root: ['page', '.tw-root'],
        universal: ['view', 'text'],
      },
    })
    expect(rootRule.toString()).toContain(':is(page,.tw-root) :is(view,text)')
    expect(rootRule.toString()).not.toContain(':not()')

    const removedPseudoRoot = postcss.parse('.a::before{color:red;}')
    const removedPseudoRule = removedPseudoRoot.first as Rule
    ruleTransformSync(removedPseudoRule, {
      uniAppX: true,
      cssSelectorReplacement: {
        universal: 'uv-view',
      },
    } as IStyleHandlerOptions)
    expect(removedPseudoRule.parent).toBeUndefined()

    const uniAppXRoot = postcss.parse('.b:where(.c,.d){color:red;}')
    const uniAppXRule = uniAppXRoot.first as Rule
    ruleTransformSync(uniAppXRule, {
      uniAppX: true,
    } as IStyleHandlerOptions)
    expect(uniAppXRule.parent).toBeUndefined()

    const removedRoot = postcss.parse(':where(){color:red;}')
    const removedRule = removedRoot.first as Rule
    ruleTransformSync(removedRule, {})
    expect(removedRule.parent).toBeUndefined()
  })

  it('ruleTransformSync removes hover selectors when configured', () => {
    const root = postcss.parse('.btn:hover,.btn:active{color:red;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {
      cssRemoveHoverPseudoClass: true,
    })

    expect(rule.toString()).toBe('.btn:active{color:red;}')
  })

  it('ruleTransformSync keeps mini-program before and after but removes them for uni-app-x', () => {
    const miniProgram = postcss.parse('.a:before,.b:after,.c::file-selector-button{color:red;}')
    const miniProgramRule = miniProgram.first as Rule
    ruleTransformSync(miniProgramRule, {})
    expect(miniProgramRule.toString()).toContain('.a::before')
    expect(miniProgramRule.toString()).toContain('.b::after')
    expect(miniProgramRule.toString()).not.toContain('file-selector-button')

    const uniAppX = postcss.parse('.a:before,.b{color:red;}')
    const uniAppXRule = uniAppX.first as Rule
    ruleTransformSync(uniAppXRule, { uniAppX: true } as IStyleHandlerOptions)
    expect(uniAppXRule.toString()).toBe('.b{color:red;}')
  })

  it('ruleTransformSync expands single where branch and nested is branches', () => {
    const root = postcss.parse('.scope:where(.a){color:red}.field:where(:is(.x,.y)){color:blue}')
    root.walkRules(rule => ruleTransformSync(rule, {}))
    const css = root.toString()

    expect(css).toContain('.scope.a')
    expect(css).toContain('.field.x')
    expect(css).toContain('.field.y')
    expect(css).not.toContain(':where')
    expect(css).not.toContain(':is(')
  })

  it('fallbackRemove handles universal selectors, hidden attributes, and important id :is branches', () => {
    const fallback = getFallbackRemove(undefined, {} as IStyleHandlerOptions)

    const universalRoot = postcss.parse('*,.keep{color:red;}')
    const universalRule = universalRoot.first as Rule
    fallback.transformSync(universalRule)
    expect(universalRule.toString()).toBe('.keep{color:red;}')

    const hiddenRoot = postcss.parse('.a[hidden]{display:none;}')
    const hiddenRule = hiddenRoot.first as Rule
    fallback.transformSync(hiddenRule)
    expect(hiddenRule.parent).toBeUndefined()

    const importantRoot = postcss.parse('#app:is(.dark,.light){color:red;}')
    const importantRule = importantRoot.first as Rule
    fallback.transformSync(importantRule)
    expect(importantRule.selector).toContain('#app.dark')

    const whereAttribute = postcss.parse('.a:where([data-state="open"],.b){color:red;}')
    const whereRule = whereAttribute.first as Rule
    fallback.transformSync(whereRule)
    expect(whereRule.selector).toBe('')

    const plainIsRoot = postcss.parse('.scope :is(.a,.b){color:red;}')
    const plainIsRule = plainIsRoot.first as Rule
    fallback.transformSync(plainIsRule, { updateSelector: true })
    expect(plainIsRule.selector).toBe('.scope .a')

    const notPlaceholderRoot = postcss.parse('.a:not(#\\#){color:red;}')
    const notPlaceholderRule = notPlaceholderRoot.first as Rule
    fallback.transformSync(notPlaceholderRule, { updateSelector: true })
    expect(notPlaceholderRule.selector).toContain(':not(#n)')
  })

  it('covers direct selector transformer node helper branches', () => {
    const context: any = {
      options: {
        cssRemoveHoverPseudoClass: true,
        cssChildCombinatorReplaceValue: ['view', 'text'],
      },
      rootReplacement: 'page',
      universalReplacement: 'view',
    }

    const selector = psp().astSync('.hover\\:bg:hover > :not([hidden]) ~ :not(template),.plain *').nodes[0]
    const classNode = selector.nodes[0]
    const pseudoNode = selector.nodes[1]
    const combinatorNode = selector.nodes[3]
    handleClassNode(classNode, context)
    handleClassNode({ type: 'tag', value: 'view' } as any, context)
    expect((classNode as any).value).toBe('hover_cbg')

    handlePseudoNode({ type: 'tag', value: 'view' } as any, 0, context, selector)
    handlePseudoNode(pseudoNode, 1, context, selector)
    expect(pseudoNode.value).toBe(':hover')
    expect(shouldRemoveEmptyFunctionalPseudo(psp.pseudo({ value: ':not' }))).toBe(true)
    expect(shouldRemoveEmptyFunctionalPseudo(psp.pseudo({ value: ':hover' }))).toBe(false)

    handleCombinatorNode({ type: 'tag', value: 'view' } as any, 0, context)
    handleCombinatorNode(combinatorNode, 3, context)
    expect(context.requiresSpacingNormalization).toBeUndefined()

    const universalSelector = psp().astSync('.plain *').nodes[0]
    const universal = universalSelector.nodes[2]
    handleUniversalNode(universal, context)
    handleUniversalNode({ type: 'tag', value: 'view' } as any, context)
    expect((universal as any).value).toBe('view')

    const hoverSelector = psp().astSync('.btn:hover').nodes[0]
    expect(shouldRemoveUnsupportedPseudoElementSelector(hoverSelector, {})).toBe(false)
    handleSelectorNode(hoverSelector, context)
    expect(hoverSelector.parent).toBeUndefined()

    const backdropSelector = psp().astSync('.btn::backdrop').nodes[0]
    expect(shouldRemoveUnsupportedPseudoElementSelector(backdropSelector, {})).toBe(true)
    handleSelectorNode(backdropSelector, { ...context, options: {} })
    expect(backdropSelector.parent).toBeUndefined()

    const beforeSelector = psp().astSync('.btn::before').nodes[0]
    expect(shouldRemoveUnsupportedPseudoElementSelector(beforeSelector, {})).toBe(false)
    expect(shouldRemoveUnsupportedPseudoElementSelector(beforeSelector, { uniAppX: true } as IStyleHandlerOptions)).toBe(true)

    const rootPseudo = psp.pseudo({ value: ':root' })
    handlePseudoNode(rootPseudo, 0, { ...context, rootReplacement: undefined }, undefined)
    expect(rootPseudo.value).toBe(':root')

    const emptyWhere = psp.pseudo({ value: ':where' })
    handlePseudoNode(emptyWhere, 0, context, undefined)
    expect(emptyWhere.value).toBe(':where')
  })
})
