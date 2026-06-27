import postcss from 'postcss'
import {
  compileCssMacroConditionalComments,
  CSS_MACRO_POSTCSS_PLUGIN_NAME,
  cssMacroPostcssPlugin,
  hasCssMacroStyleOptions,
  hasCssMacroTailwindV4CustomVariantConditionalComments,
  hasCssMacroTailwindV4Directive,
  hasCssMacroTailwindV4InternalAtRules,
  hasCssMacroTailwindV4Source,
  transformCssMacroCss,
  transformCssMacroTailwindV4Source,
  withCssMacroStyleOptions,
} from '@/index'
import {
  ifdef,
  ifdefAtRule,
  ifndef,
  ifndefAtRule,
  createConditionalAtRule,
  createNegativeConditionalAtRule,
  matchCustomPropertyFromValue,
  normalComment,
  parseConditionalAtRuleParam,
  uniAppPlatform,
} from '@/css-macro/constants'

describe('css macro helpers', () => {
  it('normalizes conditional comments and at-rule params', () => {
    expect(uniAppPlatform).toContain('MP-WEIXIN')
    expect(createConditionalAtRule('MP-"WEIXIN"')).toBe('@weapp-tw-ifdef "MP-\\"WEIXIN\\""{&}')
    expect(createNegativeConditionalAtRule('C:\\MP')).toBe('@weapp-tw-ifndef "C:\\\\MP"{&}')
    expect(normalComment('H5_||_MP-WEIXIN')).toBe('H5 || MP-WEIXIN')
    expect(normalComment('H5\\_||\\_MP-WEIXIN')).toBe('H5\\_||\\_MP-WEIXIN')
    expect(ifdef('MP-WEIXIN')).toEqual({ start: '#ifdef MP-WEIXIN', end: '#endif' })
    expect(ifndef('H5 && APP')).toEqual({ start: '#ifndef H5 && APP', end: '#endif' })
    expect(parseConditionalAtRuleParam('"MP-\\\"WEIXIN"')).toBe('MP-"WEIXIN')
    expect(parseConditionalAtRuleParam('MP-WEIXIN')).toBe('MP-WEIXIN')
  })

  it('matches custom platform query values', () => {
    const values: Array<[string, number]> = []

    matchCustomPropertyFromValue(
      'screen and (weapp-tw-platform:"MP-WEIXIN") and (weapp-tw-platform:"H5 || APP")',
      (match, index) => {
        values.push([match[1]!, index])
      },
    )

    expect(values).toEqual([
      ['MP-WEIXIN', 0],
      ['H5 || APP', 1],
    ])
  })

  it('detects css macro tailwind v4 sources', () => {
    expect(hasCssMacroTailwindV4Directive(undefined)).toBe(false)
    expect(hasCssMacroTailwindV4Directive('@plugin "weapp-tailwindcss/css-macro";')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url(weapp-tailwindcss/css-macro);')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url("weapp-tailwindcss/css-macro");')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin "./css-macro.mjs";')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin "tailwindcss";')).toBe(false)
    expect(hasCssMacroTailwindV4Directive('@plugin "weapp-tailwindcss/css-macro"; {')).toBe(true)

    const customVariant = [
      '@custom-variant wx {',
      '  /* #ifdef MP-WEIXIN */',
      '  @slot;',
      '  /* #endif */',
      '}',
    ].join('\n')
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments(customVariant)).toBe(true)
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments('@custom-variant wx { @slot; }')).toBe(false)
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments('@custom-variant wx { /* #ifdef MP-WEIXIN */ color:red; /* #endif */ }')).toBe(false)

    expect(hasCssMacroTailwindV4InternalAtRules(`@${ifdefAtRule} "MP-WEIXIN" { .a { color: red } }`)).toBe(true)
    expect(hasCssMacroTailwindV4InternalAtRules(`@${ifdefAtRule} "MP-WEIXIN"`)).toBe(true)
    expect(hasCssMacroTailwindV4InternalAtRules('@media (min-width: 1px) {}')).toBe(false)
    expect(hasCssMacroTailwindV4InternalAtRules('.broken{color:red')).toBe(false)
    expect(hasCssMacroTailwindV4Source(customVariant)).toBe(true)
    expect(hasCssMacroTailwindV4Source(undefined)).toBe(false)
  })

  it('rewrites custom variant conditional comments into internal at-rules', () => {
    const css = [
      '@custom-variant wx {',
      '  /* #ifdef MP-WEIXIN */',
      '  @slot;',
      '  /* #endif */',
      '}',
      '@custom-variant h5 {',
      '  /* #ifndef MP-WEIXIN */',
      '  @slot;',
      '  /* #endif */',
      '}',
    ].join('\n')

    const transformed = transformCssMacroTailwindV4Source(css)
    expect(transformed).toContain(`@${ifdefAtRule} "MP-WEIXIN"`)
    expect(transformed).toContain(`@${ifndefAtRule} "MP-WEIXIN"`)
    expect(transformed).not.toContain('/* #ifdef')
    expect(transformCssMacroTailwindV4Source('@custom-variant wx { @slot; }')).toBe('@custom-variant wx { @slot; }')
    expect(transformCssMacroTailwindV4Source('@custom-variant wx { /* #ifdef MP-WEIXIN */')).toBe('@custom-variant wx { /* #ifdef MP-WEIXIN */')
    expect(transformCssMacroTailwindV4Source('@custom-variant wx { /* #ifdef MP-WEIXIN */ color:red; /* #endif */ }')).toBe('@custom-variant wx { /* #ifdef MP-WEIXIN */ color:red; /* #endif */ }')
  })

  it('compiles conditional comments for matching and non-matching platforms', () => {
    const css = [
      '.base { color: black; }',
      '/* #ifdef MP-WEIXIN */',
      '.wx { color: green; }',
      '/* #endif */',
      '/* #ifndef MP-WEIXIN */',
      '.not-wx { color: red; }',
      '/* #endif */',
    ].join('\n')

    const weixin = compileCssMacroConditionalComments(css, { platform: 'mp-weixin' })
    expect(weixin).toContain('.wx')
    expect(weixin).not.toContain('.not-wx')
    expect(weixin).not.toContain('#ifdef')

    const web = compileCssMacroConditionalComments(css, { platform: 'h5' })
    expect(web).not.toContain('.wx')
    expect(web).toContain('.not-wx')

    expect(compileCssMacroConditionalComments(css)).toBe(css)
  })

  it('compiles css macro conditionals across platform aliases', () => {
    const css = [
      '/* #ifdef APP */',
      '.app { color: green; }',
      '/* #endif */',
      '/* #ifdef WEB || MP-WEIXIN */',
      '.web-or-wx { color: blue; }',
      '/* #endif */',
      '/* #ifdef QUICKAPP-WEBVIEW */',
      '.quick { color: purple; }',
      '/* #endif */',
    ].join('\n')

    expect(compileCssMacroConditionalComments(css, { platform: 'app-plus' })).toContain('.app')
    expect(compileCssMacroConditionalComments(css, { platform: 'web' })).toContain('.web-or-wx')
    expect(compileCssMacroConditionalComments(css, { platform: 'quickapp-webview-union' })).toContain('.quick')
  })

  it('keeps unknown conditional expressions as comments while removing inactive nested nodes', () => {
    const css = [
      '/* #ifdef MP-WEIXIN && (bad) */',
      '.maybe { color: green; }',
      '/* #endif */',
      '/* #ifdef MP-WEIXIN */',
      '.outer {',
      '  color: green;',
      '  /* #ifndef MP-WEIXIN */',
      '  background: red;',
      '  /* #endif */',
      '}',
      '/* #endif */',
    ].join('\n')

    const transformed = compileCssMacroConditionalComments(css, { platform: 'mp-weixin' })
    expect(transformed).toContain('#ifdef MP-WEIXIN && (bad)')
    expect(transformed).toContain('.maybe')
    expect(transformed).toContain('.outer')
    expect(transformed).not.toContain('background: red')
  })

  it('transforms internal macro at-rules and media platform queries through postcss', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process([
      '.before { color: black; }',
      `@${ifdefAtRule} "MP-WEIXIN" { .modern { color: blue; } }`,
      `@${ifndefAtRule} "H5" { .not-h5 { color: green; } }`,
      '@media not screen and (weapp-tw-platform:"MP-WEIXIN") { .legacy { color: red; } }',
      '.parent { @media (weapp-tw-platform:"H5") { color: pink; } }',
    ].join('\n'), {
      from: undefined,
    })

    expect(cssMacroPostcssPlugin().postcssPlugin).toBe(CSS_MACRO_POSTCSS_PLUGIN_NAME)
    expect(result.css).toContain('/* #ifdef MP-WEIXIN */')
    expect(result.css).toContain('/* #ifndef H5 */')
    expect(result.css).toContain('/* #ifndef MP-WEIXIN */')
    expect(result.css).toContain('.parent')
    expect(result.css).not.toContain('@media')
    expect(result.css).not.toContain(`@${ifdefAtRule}`)
  })

  it('adds css macro postcss plugin to style options once', () => {
    const base = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: [{ postcssPlugin: 'autoprefixer' }],
      },
    })

    expect(hasCssMacroStyleOptions(base)).toBe(true)
    expect(base.postcssOptions?.plugins).toHaveLength(2)

    const again = withCssMacroStyleOptions(base)
    expect(again.postcssOptions?.plugins).toHaveLength(2)

    const objectPlugins = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: {
          macro: cssMacroPostcssPlugin(),
        },
      },
    })
    expect(objectPlugins.postcssOptions?.plugins).toHaveLength(1)

    const objectPluginsWithoutMacro = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: {
          alpha: { postcssPlugin: 'alpha' },
          disabled: false,
        },
      },
    })
    expect(objectPluginsWithoutMacro.postcssOptions?.plugins).toHaveLength(2)

    const noPlugins = withCssMacroStyleOptions({})
    expect(noPlugins.postcssOptions?.plugins).toHaveLength(1)

    const invalidPlugins = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: 'invalid' as any,
      },
    })
    expect(invalidPlugins.postcssOptions?.plugins).toHaveLength(1)

    expect(hasCssMacroStyleOptions(undefined)).toBe(false)
  })

  it('keeps function-style css macro plugin entries without appending duplicates', () => {
    const macroLike = Object.assign(() => undefined, {
      postcssPlugin: CSS_MACRO_POSTCSS_PLUGIN_NAME,
    })
    const options = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: [macroLike],
      },
    })

    expect(options.postcssOptions?.plugins).toEqual([macroLike])
  })

  it('runs full css macro css transform with platform filtering', async () => {
    const css = [
      `@${ifdefAtRule} "MP-WEIXIN" { .wx { color: green; } }`,
      `@${ifndefAtRule} "MP-WEIXIN" { .web { color: red; } }`,
    ].join('\n')

    const transformed = await transformCssMacroCss(css, { platform: 'weapp' })
    expect(transformed).toContain('.wx')
    expect(transformed).not.toContain('.web')
    expect(transformed).not.toContain('#ifdef')
  })
})
