// import plugin from 'tailwindcss/plugin'
import { getCss } from '#test/helpers/getTwCss'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
// import twPlugin from '../../dist/css-macro'
import twPlugin from '@/css-macro'
import { normalComment } from '@/css-macro/constants'
import postcssPlugin from '@/css-macro/postcss'
import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

let cssMacroPluginPath: string

beforeAll(async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'weapp-tw-css-macro-'))
  cssMacroPluginPath = path.join(dir, 'css-macro.mjs').replaceAll('\\', '/')
  await writeFile(
    cssMacroPluginPath,
    [
      'const quote = value => `"${String(value).replaceAll("\\\\", "\\\\\\\\").replaceAll("\\"", "\\\\\\"")}"`;',
      'const conditional = (name, value) => `@${name} ${quote(value)}{&}`;',
      'export default function cssMacro({ matchVariant, addVariant }) {',
      '  if (typeof matchVariant === "function") {',
      '    matchVariant("ifdef", value => conditional("weapp-tw-ifdef", value));',
      '    matchVariant("ifndef", value => conditional("weapp-tw-ifndef", value));',
      '  }',
      '  if (typeof addVariant === "function") {',
      '    for (const [name, config] of Object.entries({})) {',
      '      const normalized = typeof config === "string" ? { value: config, negative: false } : config;',
      '      addVariant(name, conditional(normalized.negative ? "weapp-tw-ifndef" : "weapp-tw-ifdef", normalized.value));',
      '    }',
      '  }',
      '}',
      '',
    ].join('\n'),
    'utf8',
  )
})

function createTailwindV4MacroCss() {
  return `
@plugin "${cssMacroPluginPath}";
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --color-red-500: oklch(63.7% 0.237 25.331);
}
@tailwind utilities;
`
}

// not screen and (weapp-tw-platform:MP-WEIXIN)
// not screen and (weapp-tw-platform:uniVersion > 3.9)
// not screen and (weapp-tw-platform:H5 || MP-WEIXIN)
describe('css-macro tailwindcss plugin', () => {
  it('auto enables postcss macro transform for tailwindcss v4 @plugin', async () => {
    const source = await resolveTailwindV4Source({
      css: createTailwindV4MacroCss(),
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['ifdef-[MP-WEIXIN]:bg-blue-500'],
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(result.rawCss).toContain('@weapp-tw-ifdef')
    expect(result.css).toContain('#ifdef MP-WEIXIN')
    expect(result.css).toContain('#endif')
    expect(result.css).not.toContain('@media')
    expect(result.css).not.toContain('@weapp-tw-ifdef')
  })

  it('compiles tailwindcss v4 css-macro comments by mini-program platform before final css output', async () => {
    const source = await resolveTailwindV4Source({
      css: createTailwindV4MacroCss(),
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['ifdef-[MP-WEIXIN]:bg-blue-500', 'ifndef-[MP-WEIXIN]:bg-red-500'],
      styleOptions: {
        isMainChunk: false,
        platform: 'mp-weixin',
      },
    })

    expect(result.rawCss).toContain('@weapp-tw-ifdef')
    expect(result.rawCss).toContain('@weapp-tw-ifndef')
    expect(result.css).toContain('.ifdef-_bMP-WEIXIN_B_cbg-blue-500')
    expect(result.css).not.toContain('.ifndef-_bMP-WEIXIN_B_cbg-red-500')
    expect(result.css).not.toContain('#ifdef MP-WEIXIN')
    expect(result.css).not.toContain('#ifndef MP-WEIXIN')
    expect(result.css).not.toContain('@weapp-tw-ifdef')
    expect(result.css).not.toContain('@weapp-tw-ifndef')
  })

  it('auto enables postcss macro transform for tailwindcss v4 web target', async () => {
    const source = await resolveTailwindV4Source({
      css: createTailwindV4MacroCss(),
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      target: 'web',
      candidates: ['ifdef-[H5]:bg-blue-500'],
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(result.rawCss).toContain('@weapp-tw-ifdef')
    expect(result.css).toContain('/* #ifdef H5 */\n.ifdef-\\[H5\\]\\:bg-blue-500')
    expect(result.css).toContain('/* #endif */')
    expect(result.css).not.toContain('@weapp-tw-ifdef')
    expect(result.css).not.toContain('.ifdef-_bH5_B_cbg-blue-500')
  })

  it('compiles tailwindcss v4 css-macro comments by web platform before final css output', async () => {
    const source = await resolveTailwindV4Source({
      css: createTailwindV4MacroCss(),
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      target: 'web',
      candidates: ['ifdef-[MP-WEIXIN]:bg-blue-500', 'ifndef-[MP-WEIXIN]:bg-red-500'],
      styleOptions: {
        isMainChunk: false,
        platform: 'h5',
      },
    })

    expect(result.rawCss).toContain('@weapp-tw-ifdef')
    expect(result.rawCss).toContain('@weapp-tw-ifndef')
    expect(result.css).not.toContain('.ifdef-\\[MP-WEIXIN\\]\\:bg-blue-500')
    expect(result.css).toContain('.ifndef-\\[MP-WEIXIN\\]\\:bg-red-500')
    expect(result.css).not.toContain('#ifdef MP-WEIXIN')
    expect(result.css).not.toContain('#ifndef MP-WEIXIN')
    expect(result.css).not.toContain('@weapp-tw-ifdef')
    expect(result.css).not.toContain('@weapp-tw-ifndef')
  })

  it('keeps postcss compatibility with legacy media macro output', async () => {
    const { css } = await postcss(postcssPlugin).process(
      '@media (weapp-tw-platform:"MP-WEIXIN") {.legacy{color:blue}}',
      {
        from: undefined,
      },
    )

    expect(css).toContain('#ifdef MP-WEIXIN')
    expect(css).toContain('.legacy')
    expect(css).not.toContain('@media')
  })

  it('prints conditional comments on standalone lines', async () => {
    const { css } = await postcss(postcssPlugin).process(
      '.prev{color:black}@media (weapp-tw-platform:"MP-WEIXIN") {.legacy{color:blue}} .next{color:red}',
      {
        from: undefined,
      },
    )

    expect(css).toBe([
      '.prev{color:black}',
      '/* #ifdef MP-WEIXIN */',
      '.legacy{color:blue}',
      '/* #endif */',
      '.next{color:red}',
    ].join('\n'))
  })

  it('expands internal conditional at-rules without media wrappers', async () => {
    const { css } = await postcss(postcssPlugin).process(
      '@weapp-tw-ifdef "MP-WEIXIN" {.modern{color:blue}}',
      {
        from: undefined,
      },
    )

    expect(css).toContain('#ifdef MP-WEIXIN')
    expect(css).toContain('.modern')
    expect(css).not.toContain('@media')
    expect(css).not.toContain('@weapp-tw-ifdef')
  })

  it('hoists nested internal conditional at-rules around complete rules', async () => {
    const { css } = await postcss(postcssPlugin).process(
      '.ifdef-\\[H5\\]\\:bg-blue-500 {@weapp-tw-ifdef "H5" {color:blue}}',
      {
        from: undefined,
      },
    )

    expect(css).toBe([
      '/* #ifdef H5 */',
      '.ifdef-\\[H5\\]\\:bg-blue-500 {color:blue}',
      '/* #endif */',
    ].join('\n'))
  })

  it('dynamic case 0', async () => {
    const { css } = await getCss('ifdef-[MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 1', async () => {
    const { css } = await getCss('ifndef-[MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 2', async () => {
    const { css } = await getCss('ifndef-[uniVersion>3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 3', async () => {
    const { css } = await getCss('ifndef-[uniVersion_>_3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 4', async () => {
    const { css } = await getCss('ifndef-[uni\\_version_>_3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 5', async () => {
    const { css } = await getCss('ifndef-[H5||MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 5 ifdef without spaces', async () => {
    const { css } = await getCss('ifdef-[H5||MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 5 ifdef with underscored spaces', async () => {
    const { css } = await getCss('ifdef-[H5_||_MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic apply case 6', async () => {
    const { css } = await getCss('', {
      css: `.apply-test {
        @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;
      }`,
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic apply case 7', async () => {
    const { css } = await getCss('', {
      css: `.apply-test {
        @apply ifdef-[H5_||_MP-WEIXIN]:bg-blue-400 ifndef-[H5_||_MP-WEIXIN]:bg-red-400;
      }`,
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic apply case 8', async () => {
    const { css } = await getCss('', {
      css: `.apply-test {
        @apply ifdef-[H5\\_||\\_MP-WEIXIN]:bg-blue-400 ifndef-[H5\\_||\\_MP-WEIXIN]:bg-red-400;
      }`,
      twConfig: {
        plugins: [twPlugin],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('postcss expand case 0', async () => {
    const { css: cssOutput } = await postcss(postcssPlugin).process(
      `@media not screen and (weapp-tw-platform:"MP-WEIXIN") {
      .-wxcbg-red-500 {
          --tw-bg-opacity: 1;
          background-color: rgb(239 68 68 / var(--tw-bg-opacity));
      }
      }`,
      {
        from: undefined,
      },
    )
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('postcss expand case 1', async () => {
    const { css } = await postcss(postcssPlugin)
      .process(
        `@media not screen and (weapp-tw-platform:"MP-WEIXIN") {
        .ifndef-_MP-WEIXIN_cbg-red-500 {
            --tw-bg-opacity: 1;
            background-color: rgb(239 68 68 / var(--tw-bg-opacity));
        }
        }`,
        {
          from: undefined,
        },
      )
      .async()
    expect(css).toMatchSnapshot('postcss')
  })

  it('static case 0', async () => {
    const { css } = await getCss('wx:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              wx: 'MP-WEIXIN',
            },
          }),
        ],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static negative case 1', async () => {
    const { css } = await getCss('not-wx:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              'not-wx': {
                value: 'MP-WEIXIN',
                negative: true,
              },
            },
          }),
        ],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static case 2', async () => {
    const { css } = await getCss('hv:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              hv: {
                value: 'uniVersion > 3.9',
              },
            },
          }),
        ],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static case 3', async () => {
    const { css } = await getCss('mv:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              mv: {
                value: 'H5 || MP-WEIXIN',
              },
            },
          }),
        ],
      },
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('comment error case 0', () => {
    let root = postcss.parse('/**\n*/')
    expect(root).toBeDefined()
    root = postcss.parse('/*  #ifdef  %PLATFORM%  */\n.a{}\n/*  #endif  */')
    expect(root).toBeDefined()
    root = postcss.parse('/*  #ifdef  %PLATFORM%  */\n.a{}/*  #endif  */')
    expect(root).toBeDefined()
  })

  it('normalComment return self', () => {
    // @ts-ignore
    expect(normalComment([])).toEqual([])
  })

  it('fix comment eol case 0', async () => {
    const css = `/*
    #ifndef MP-WEIXIN */
   .-wxcbg-red-500 {
     --tw-bg-opacity: 1;
     background-color: rgb(239 68 68 / var(--tw-bg-opacity));
   }
   /*
    #endif */
   `
    const root = postcss.parse(css)
    expect(root).toBeDefined()

    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined,
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })
})
