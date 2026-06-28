import { describe, expect, it, vi } from 'vitest'
import {
  extractGeneratedCssForUserLayerSelectors,
  filterApplyOnlyGeneratedCss,
  hasUserCssLayerBlocks,
  isCommentOnlyCss,
  removeMiniProgramHoverSelectors,
  removeTailwindV4GeneratedUserCssArtifacts,
  removeTailwindV4GeneratorAtRules,
  shouldFilterApplyOnlyGeneratedCss,
  splitUserCssLayerBlocks,
  stripTailwindSourceMediaFragments,
  stripUnmatchedTailwindSourceMediaCloseFragments,
  transformGeneratorUserCss,
} from '@/bundlers/shared/generator-css/user-css'

describe('generator user css helpers', () => {
  it('removes generator at-rules including fallback-unparseable blocks', () => {
    expect(removeTailwindV4GeneratorAtRules('@theme{--color-a:red}.keep{color:red}')).toBe('.keep{color:red}')
    expect(removeTailwindV4GeneratorAtRules('@source "./src"\n@theme{--color-a:red}.keep{color:red')).toContain('.keep')
    expect(removeTailwindV4GeneratorAtRules('@source "./src";.keep{color:red')).toBe('')
    expect(removeTailwindV4GeneratorAtRules('@utility btn { .nested{color:red} }\n.keep{color:blue}')).toBe('.keep{color:blue}')
    expect(removeTailwindV4GeneratorAtRules('@theme .broken{color:red')).toBe('')
    expect(removeTailwindV4GeneratorAtRules('@media source("./src") { .hidden{color:red} }\n.keep{color:blue}')).toBe('.keep{color:blue}')
    expect(removeTailwindV4GeneratorAtRules('@theme; .keep{color:red')).toBe('')
    expect(removeTailwindV4GeneratorAtRules('@source "./src"; @utility btn; .keep{color:red')).toBe('')
    expect(removeTailwindV4GeneratorAtRules('.keep{color:red}')).toBe('.keep{color:red}')
    expect(removeTailwindV4GeneratorAtRules('@source url("./{src}") @theme{--a:1}\n.keep{color:red')).toContain('.keep')
    expect(removeTailwindV4GeneratorAtRules('@media source("./src") {')).toBe('')
  })

  it('strips source media fragments and unmatched close fragments', () => {
    expect(stripTailwindSourceMediaFragments([
      '@source "./src"',
      '@theme{--color-a:red}',
      '@media source(none) {',
      '.hidden{display:none}',
      '} /* source(none) */',
      '.keep{display:block}',
    ].join('\n'))).toContain('.keep')
    expect(stripTailwindSourceMediaFragments('@source "./src"\n@theme{--color-a:red}')).toBe('')
    expect(stripTailwindSourceMediaFragments('@source not-block { .hidden{display:none} }\n.keep{display:block}')).toBe('\n.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source-media{color:red}\n.keep{display:block}')).toBe('@source-media{color:red}\n.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source "./src"\n.keep{display:block}')).toBe('')
    expect(stripTailwindSourceMediaFragments('@source url("./src@x") @theme{--a:1}')).toBe('')
    expect(stripTailwindSourceMediaFragments('@source url("./src\\\\@x") @theme{--a:1}')).toBe('')
    expect(stripTailwindSourceMediaFragments('@source "./src";\n.keep{display:block}')).toBe('@source "./src";\n.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source not-block; .keep{display:block}')).toBe('@source not-block; .keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source "./src" @theme{--color-a:red}.keep{display:block}')).toBe('.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source url("./src") @utility btn { color: red }\n.keep{display:block}')).toBe('\n.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source url("./src") { .hidden{display:none} }\n.keep{display:block}')).toBe('\n.keep{display:block}')
    expect(stripTailwindSourceMediaFragments('@source "@x";\n.keep{display:block}')).toBe('@source "@x";\n.keep{display:block}')
    expect(stripUnmatchedTailwindSourceMediaCloseFragments('}\n.keep{display:block}')).toBe('.keep{display:block')
    expect(stripUnmatchedTailwindSourceMediaCloseFragments('}\n.keep{display:block}\n}')).toBe('.keep{display:block}')
    expect(stripUnmatchedTailwindSourceMediaCloseFragments('.keep{display:block')).toBe('.keep{display:block')
    expect(stripUnmatchedTailwindSourceMediaCloseFragments('.keep{display:block}')).toBe('.keep{display:block}')
  })

  it('splits and detects user layer blocks', () => {
    const split = splitUserCssLayerBlocks('@layer components{.card{display:flex}}.plain{color:red}')

    expect(hasUserCssLayerBlocks(split.layer)).toBe(true)
    expect(split.layer).toContain('@layer components')
    expect(split.rest).toContain('.plain')
    expect(hasUserCssLayerBlocks('.plain{color:red}')).toBe(false)
    expect(hasUserCssLayerBlocks('@layer {')).toBe(true)
    expect(splitUserCssLayerBlocks('@layer {').layer).toBe('@layer {')
    expect(splitUserCssLayerBlocks('.plain{color:red}')).toEqual({
      layer: '',
      rest: '.plain{color:red}',
    })
  })

  it('extracts generated css matching user layer selectors', () => {
    const result = extractGeneratedCssForUserLayerSelectors(
      '.card{display:flex}.card:hover{color:red}.plain{color:blue}',
      '@layer components{.card{display:flex}}',
    )

    expect(result.layer).toContain('.card')
    expect(result.layer).toContain('.card:hover')
    expect(result.rest).toContain('.plain')
    expect(extractGeneratedCssForUserLayerSelectors('.broken{', '@layer components{.card{display:flex}}')).toEqual({
      layer: '',
      rest: '.broken{',
    })
    expect(extractGeneratedCssForUserLayerSelectors('.card{display:flex}', '@layer {')).toEqual({
      layer: '',
      rest: '.card{display:flex}',
    })
    expect(extractGeneratedCssForUserLayerSelectors('.plain{display:block}', '.card{display:flex}')).toEqual({
      layer: '',
      rest: '.plain{display:block}',
    })
  })

  it('filters apply-only generated css while keeping variable rules', () => {
    const source = '.card{@apply flex}.other{color:red}'
    const filtered = filterApplyOnlyGeneratedCss(
      '.card{display:flex}.card:hover{color:red}.other{color:red}:root{--x:1}',
      source,
    )

    expect(filtered).toContain('.card')
    expect(filtered).toContain('--x')
    expect(filtered).not.toContain('.other')
    expect(filterApplyOnlyGeneratedCss('.broken{', '.card{@apply flex}')).toBe('.broken{')
    expect(filterApplyOnlyGeneratedCss('.card{display:flex}', '.card{color:red}')).toBe('.card{display:flex}')
    expect(shouldFilterApplyOnlyGeneratedCss(4, 'weapp', '.card{@apply flex}', {
      hasGeneratedCss: false,
      hasGeneratedMarkers: false,
    })).toBe(true)
    expect(shouldFilterApplyOnlyGeneratedCss(4, 'web', '.card{@apply flex}', {
      hasGeneratedCss: false,
      hasGeneratedMarkers: false,
    })).toBe(false)
    expect(shouldFilterApplyOnlyGeneratedCss(4, 'weapp', '@tailwind utilities;\n.card{@apply flex}', {
      hasGeneratedCss: false,
      hasGeneratedMarkers: false,
    })).toBe(false)
    expect(shouldFilterApplyOnlyGeneratedCss(4, 'weapp', '.card{@apply flex}.other{color:red}', {
      hasGeneratedCss: false,
      hasGeneratedMarkers: false,
    })).toBe(false)
    expect(shouldFilterApplyOnlyGeneratedCss(4, 'weapp', '.card{@apply flex}', {
      hasGeneratedCss: true,
      hasGeneratedMarkers: false,
    })).toBe(false)
  })

  it('removes hover selectors and generated artifacts from mini-program css', async () => {
    expect(removeMiniProgramHoverSelectors('.btn:hover{color:red}.btn{color:blue}')).toContain('.btn{color:blue}')
    expect(removeMiniProgramHoverSelectors('@media screen{.btn:hover{color:red}}.btn{color:blue}')).toBe('.btn{color:blue}')
    expect(removeMiniProgramHoverSelectors('.btn:hover{color:red}', false)).toContain(':hover')
    expect(removeMiniProgramHoverSelectors('.broken:hover{')).toBe('.broken:hover{')
    expect(isCommentOnlyCss('/* only comment */')).toBe(true)
    expect(isCommentOnlyCss('.broken{')).toBe(false)
    expect(removeTailwindV4GeneratedUserCssArtifacts('/* Deprecated */\n.keep{color:red}')).toBe('.keep{color:red}')
    expect(removeTailwindV4GeneratedUserCssArtifacts([
      'page{--color-red-500:red}',
      '[hidden]:not([hidden="until-found"]){display:none}',
      'abbr[title]{text-decoration:underline}',
      'button,input[type="button"],input[type="reset"],input[type="submit"]{appearance:button}',
      '.keep{color:red}',
    ].join('\n'))).toBe('.keep{color:red}')
    expect(removeTailwindV4GeneratedUserCssArtifacts('.broken{')).toBe('.broken{')

    const styleHandler = vi.fn(async (css: string) => ({ css: `${css}.handled{color:green}` }))
    const transformed = await transformGeneratorUserCss('.btn:hover{color:red}.btn{color:blue}', {
      generatorTarget: 'weapp',
      generatorStyleOptions: { cssRemoveHoverPseudoClass: true },
      cssUserHandlerOptions: {} as any,
      styleHandler,
      importFallback: true,
    })

    expect(transformed).toContain('.btn')
    expect(transformed).toContain('.handled')
    expect(styleHandler).toHaveBeenCalledWith(expect.stringContaining(':hover'), expect.objectContaining({
      cssRemoveHoverPseudoClass: true,
    }))

    await expect(transformGeneratorUserCss('.btn:hover{color:red}.btn{color:blue}', {
      generatorTarget: 'weapp',
      generatorStyleOptions: { cssRemoveHoverPseudoClass: true },
      cssUserHandlerOptions: {} as any,
      styleHandler,
      importFallback: true,
      processed: true,
    })).resolves.not.toContain(':hover')

    await expect(transformGeneratorUserCss('@media source("./src") { .hidden{color:red} }\n.web{color:blue}', {
      generatorTarget: 'web',
      generatorStyleOptions: { cssRemoveHoverPseudoClass: true },
      cssUserHandlerOptions: {} as any,
      styleHandler,
      importFallback: true,
      processed: true,
    })).resolves.toContain('.web')

    await expect(transformGeneratorUserCss('   ', {
      generatorTarget: 'weapp',
      generatorStyleOptions: {},
      cssUserHandlerOptions: {} as any,
      styleHandler,
      importFallback: true,
    })).resolves.toBe('')
  })
})
