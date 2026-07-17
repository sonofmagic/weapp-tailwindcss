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
  const originalUniPlatform = process.env.UNI_PLATFORM
  const originalTaroEnv = process.env.TARO_ENV

  afterEach(() => {
    if (originalUniPlatform === undefined) {
      delete process.env.UNI_PLATFORM
    }
    else {
      process.env.UNI_PLATFORM = originalUniPlatform
    }
    if (originalTaroEnv === undefined) {
      delete process.env.TARO_ENV
    }
    else {
      process.env.TARO_ENV = originalTaroEnv
    }
  })

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
    expect(hasCssMacroTailwindV4Directive('@plugin "tailwindcss"; /* css-macro mention */')).toBe(false)
    expect(hasCssMacroTailwindV4Directive('@plugin "weapp-tailwindcss/css-macro";')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url(weapp-tailwindcss/css-macro);')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url("weapp-tailwindcss/css-macro");')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url(\'./css-macro.js\');')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin "./css-macro.mjs";')).toBe(true)
    expect(hasCssMacroTailwindV4Directive('@plugin url("./not-macro.js"); /* css-macro */')).toBe(false)
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
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments(undefined)).toBe(false)
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments('@custom-variant wx { @slot; }')).toBe(false)
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments('@custom-variant wx { /* #ifdef MP-WEIXIN */ color:red; /* #endif */ }')).toBe(false)
    expect(hasCssMacroTailwindV4CustomVariantConditionalComments('@custom-variant wx { /* #ifdef MP-WEIXIN */ @slot; }')).toBe(false)

    expect(hasCssMacroTailwindV4InternalAtRules(undefined)).toBe(false)
    expect(hasCssMacroTailwindV4InternalAtRules(`@${ifdefAtRule} "MP-WEIXIN" { .a { color: red } }`)).toBe(true)
    expect(hasCssMacroTailwindV4InternalAtRules(`@${ifdefAtRule} "MP-WEIXIN"`)).toBe(true)
    expect(hasCssMacroTailwindV4InternalAtRules('@media (min-width: 1px) {}')).toBe(false)
    expect(hasCssMacroTailwindV4InternalAtRules('.broken{color:red')).toBe(false)
    expect(hasCssMacroTailwindV4Source(customVariant)).toBe(true)
    expect(hasCssMacroTailwindV4Source(undefined)).toBe(false)
    expect(hasCssMacroTailwindV4Source('.broken{color:red')).toBe(false)
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
    expect(transformCssMacroTailwindV4Source('@custom-variant wx { /* #ifdef MP-WEIXIN */ /* #ifdef H5 */ @slot; /* #endif */ /* #endif */ }')).toContain(`@${ifdefAtRule} "MP-WEIXIN"`)
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

  it('uses alternate macro environment variables and keeps unresolved parent comments', () => {
    delete process.env.UNI_PLATFORM
    process.env.TARO_ENV = 'h5'
    const envCss = [
      '/* #ifdef WEB */',
      '.web { color: green; }',
      '/* #endif */',
      '/* #ifdef MP */',
      '.mp { color: red; }',
      '/* #endif */',
    ].join('\n')
    const envResult = compileCssMacroConditionalComments(envCss)
    expect(envResult).toContain('.web')
    expect(envResult).not.toContain('.mp')

    const unresolvedParent = [
      '/* #ifdef MP-WEIXIN && (bad) */',
      '/* #ifdef MP-WEIXIN */',
      '.maybe { color: green; }',
      '/* #endif */',
      '/* #endif */',
    ].join('\n')
    const transformed = compileCssMacroConditionalComments(unresolvedParent, { platform: 'mp-weixin' })
    expect(transformed).toContain('#ifdef MP-WEIXIN && (bad)')
    expect(transformed).toContain('#ifdef MP-WEIXIN')
    expect(transformed).toContain('.maybe')
  })

  it('resolves macro platform from environment variables when no explicit platform is provided', () => {
    process.env.UNI_PLATFORM = 'mp_weixin'
    const css = [
      '/* #ifdef WX */',
      '.wx { color: green; }',
      '/* #endif */',
      '/* #ifdef H5 */',
      '.web { color: red; }',
      '/* #endif */',
    ].join('\n')

    const transformed = compileCssMacroConditionalComments(css)
    expect(transformed).toContain('.wx')
    expect(transformed).not.toContain('.web')
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

  it('handles false, unknown and empty conditional branches', () => {
    const css = [
      '/* #ifdef */',
      '.empty { color: red; }',
      '/* #endif */',
      '/* #ifdef MP-WEIXIN && H5 */',
      '.never { color: red; }',
      '/* #endif */',
      '/* #ifdef UNKNOWN */',
      '.unknown { color: blue; }',
      '/* #endif */',
    ].join('\n')

    const transformed = compileCssMacroConditionalComments(css, { platform: 'mp-weixin' })
    expect(transformed).toContain('#ifdef')
    expect(transformed).not.toContain('.never')
    expect(transformed).not.toContain('.unknown')
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

  it('formats root and nested macro at-rules around sibling nodes', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process([
      `@${ifdefAtRule} "MP-WEIXIN" { .first { color: green; } }`,
      '.between { color: black; }',
      `.parent { color: red; @${ifndefAtRule} "H5" { background: blue; } }`,
      '.after { color: gray; }',
    ].join('\n'), {
      from: undefined,
    })

    expect(result.css).toContain('/* #ifdef MP-WEIXIN */')
    expect(result.css).toContain('/* #ifndef H5 */')
    expect(result.css).toContain('.parent { color: red')
    expect(result.css).toContain('.parent { background: blue')
    expect(result.css).toContain('.after')
  })

  it('unwraps direct nesting selectors emitted inside conditional variants', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process(
      `.variant { @${ifdefAtRule} "MP-WEIXIN" { & { color: blue; } } }`,
      { from: undefined },
    )

    expect(result.css).toBe([
      '/* #ifdef MP-WEIXIN */',
      '.variant { color: blue }',
      '/* #endif */',
    ].join('\n'))
    expect(result.css).not.toContain('&')
  })

  it('keeps non-rule nested macro at-rules untouched and normalizes existing comments', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process([
      '@media (min-width: 1px) {',
      `  @${ifdefAtRule} "MP-WEIXIN" { .inside { color: green; } }`,
      '}',
      '/*#ifdef MP-WEIXIN*/',
      '.keep { color: red; }',
      '/*#endif*/',
    ].join('\n'), {
      from: undefined,
    })

    expect(result.css).toContain('@media')
    expect(result.css).toContain('/* #ifdef MP-WEIXIN */')
    expect(result.css).toContain('/* #endif */')
  })

  it('keeps root macro at-rules without child nodes as comments', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process([
      `@${ifdefAtRule} "MP-WEIXIN";`,
      '.after { color: gray; }',
    ].join('\n'), {
      from: undefined,
    })

    expect(result.css).toContain('/* #ifdef MP-WEIXIN */')
    expect(result.css).toContain('/* #endif */')
    expect(result.css).toContain('.after')
  })

  it('ignores media platform queries without custom properties', async () => {
    const result = await postcss([cssMacroPostcssPlugin()]).process([
      '@media (min-width: 1px) { .card { color: red; } }',
      '@media (weapp-tw-platform:"MP-WEIXIN") { .wx { color: green; } }',
    ].join('\n'), {
      from: undefined,
    })

    expect(result.css).toContain('@media (min-width: 1px)')
    expect(result.css).toContain('/* #ifdef MP-WEIXIN */')
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

    const functionPlugin = () => undefined
    ;(functionPlugin as any).postcssPlugin = CSS_MACRO_POSTCSS_PLUGIN_NAME
    const functionPluginOptions = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: [functionPlugin],
      },
    })
    expect(functionPluginOptions.postcssOptions?.plugins).toEqual([functionPlugin])

    const directCreatorOptions = withCssMacroStyleOptions({
      postcssOptions: {
        plugins: [cssMacroPostcssPlugin],
      },
    })
    expect(directCreatorOptions.postcssOptions?.plugins).toEqual([cssMacroPostcssPlugin])

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
