import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import weappTailwindcss from '@/postcss'
import { resolveSourceScanPath } from '@/tailwindcss/source-scan'

const require = createRequire(import.meta.url)
const workspaceRoot = path.resolve(__dirname, '../../../..')
const tailwindcss4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

async function createTailwindV4DirectiveFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-directives-'))
  const sourceDir = path.join(root, 'src')
  const nodeModulesDir = path.join(root, 'node_modules')
  const cssEntry = path.join(root, 'app.css')
  const configFile = path.join(root, 'tailwind.config.js')
  const pluginFile = path.join(root, 'legacy-plugin.cjs')
  const referenceFile = path.join(root, 'reference.css')
  const sourceFile = path.join(sourceDir, 'page.html')
  const ignoredSourceFile = path.join(sourceDir, 'ignored.html')

  await mkdir(sourceDir, { recursive: true })
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcss4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  await writeFile(sourceFile, '<div class="bg-source tab-8"></div>', 'utf8')
  await writeFile(ignoredSourceFile, '<div class="ignored-source"></div>', 'utf8')
  await writeFile(configFile, [
    'export default {',
    '  theme: {',
    '    extend: {',
    '      colors: { config: "#445566" },',
    '      spacing: { card: "32rpx" },',
    '      borderRadius: { card: "18rpx" },',
    '    },',
    '  },',
    '}',
  ].join('\n'), 'utf8')
  await writeFile(pluginFile, [
    'module.exports = function ({ addUtilities }) {',
    '  addUtilities({',
    '    ".plugin-card": { color: "#778899" },',
    '  })',
    '}',
  ].join('\n'), 'utf8')
  await writeFile(referenceFile, [
    '@theme {',
    '  --color-reference: #246810;',
    '}',
    '@utility ref-bg {',
    '  background-color: var(--color-reference);',
    '}',
  ].join('\n'), 'utf8')

  const css = [
    '@config "./tailwind.config.js";',
    '@plugin "./legacy-plugin.cjs";',
    '@reference "./reference.css";',
    '@import "tailwindcss" source(none);',
    '@theme {',
    '  --color-brand: #155dfc;',
    '  --color-source: #123456;',
    '  --spacing: 0.25rem;',
    '}',
    '@source "./src";',
    '@source not "./src/ignored.html";',
    '@source inline("{hover:,focus:,}underline");',
    '@source not inline("focus:underline");',
    '@source inline("theme-midnight:bg-brand any-hover:tab-4 tab-8 bg-config plugin-card card-shell function-card ref-card variant-rule");',
    '@utility tab-4 {',
    '  tab-size: 4;',
    '}',
    '@utility tab-* {',
    '  tab-size: --value(integer);',
    '}',
    '@custom-variant theme-midnight (&:where(.theme-dark, .theme-dark *));',
    '@custom-variant any-hover {',
    '  @media (any-hover: hover) {',
    '    &:hover {',
    '      @slot;',
    '    }',
    '  }',
    '}',
    '.card-shell {',
    '  @apply rounded-card bg-brand px-card;',
    '}',
    '.ref-card {',
    '  @apply ref-bg;',
    '}',
    '.variant-rule {',
    '  @variant theme-midnight {',
    '    color: var(--color-brand);',
    '  }',
    '}',
    '.function-card {',
    '  color: --alpha(var(--color-brand) / 50%);',
    '  margin: --spacing(4);',
    '  padding: theme(spacing.2);',
    '}',
    '',
  ].join('\n')

  return {
    css,
    cssEntry,
    sourceFile,
  }
}

async function createTailwindV4AddingCustomStylesFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-custom-styles-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  const cssEntry = path.join(root, 'app.css')

  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcss4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')

  const css = [
    '@import "tailwindcss" source(none);',
    '@theme {',
    '  --color-avocado-500: #84cc16;',
    '  --tab-size-github: 8;',
    '  --opacity-soft: 65%;',
    '  --aspect-ratio-retro: 4 / 3;',
    '  --text-fluid: 20px;',
    '  --leading-tightish: 1.1;',
    '}',
    '@source inline("top-[117px] lg:top-[344px] bg-[#bada55] text-[22px] before:content-[\'Festivus\'] fill-(--my-brand-color) [mask-type:luminance] hover:[mask-type:alpha] [--scroll-offset:56px] lg:[--scroll-offset:44px] grid grid-cols-[1fr_500px_2fr] bg-[url(\'/what_a_rush.png\')] before:content-[\'hello\\_world\'] text-(length:--my-var) text-(color:--my-color) card rounded-none content-auto hover:content-auto scrollbar-hidden tab-github tab-76 tab-inherit tab-[12] opacity-42 opacity-[33%] opacity-soft inset-4 -inset-4 inset-[12px] -inset-[5%] text-fluid/tightish aspect-retro aspect-3/4 aspect-[7/9] theme-midnight:bg-avocado-500 any-hover:content-auto lg:[&:nth-child(-n+3)]:hover:underline");',
    '@layer base {',
    '  h1 {',
    '    font-size: var(--text-2xl);',
    '  }',
    '}',
    '@layer components {',
    '  .card {',
    '    background-color: var(--color-white);',
    '    border-radius: var(--radius-lg);',
    '    padding: --spacing(6);',
    '    box-shadow: var(--shadow-xl);',
    '  }',
    '  .select2-dropdown {',
    '    color: var(--color-avocado-500);',
    '  }',
    '}',
    '.my-element {',
    '  background: white;',
    '  @variant dark {',
    '    @variant hover {',
    '      background: black;',
    '    }',
    '  }',
    '}',
    '@utility content-auto {',
    '  content-visibility: auto;',
    '}',
    '@utility scrollbar-hidden {',
    '  &::-webkit-scrollbar {',
    '    display: none;',
    '  }',
    '}',
    '@utility tab-* {',
    '  tab-size: --value(--tab-size-*, integer, [integer]);',
    '  tab-size: --value("inherit", "initial", "unset");',
    '}',
    '@utility opacity-* {',
    '  opacity: calc(--value(integer) * 1%);',
    '  opacity: --value(--opacity-*, [percentage]);',
    '}',
    '@utility inset-* {',
    '  inset: --spacing(--value(integer));',
    '  inset: --value([percentage], [length]);',
    '}',
    '@utility -inset-* {',
    '  inset: --spacing(--value(integer) * -1);',
    '  inset: calc(--value([percentage], [length]) * -1);',
    '}',
    '@utility text-* {',
    '  font-size: --value(--text-*, [length]);',
    '  line-height: --modifier(--leading-*, [length], [*]);',
    '}',
    '@utility aspect-* {',
    '  aspect-ratio: --value(--aspect-ratio-*, ratio, [ratio]);',
    '}',
    '@custom-variant theme-midnight (&:where(.theme-dark, .theme-dark *));',
    '@custom-variant any-hover {',
    '  @media (any-hover: hover) {',
    '    &:hover {',
    '      @slot;',
    '    }',
    '  }',
    '}',
    '',
  ].join('\n')

  return {
    css,
    cssEntry,
  }
}

async function createTailwindV4ConfigFixture(
  configSource: string,
  css: string,
  sources: Record<string, string> = {},
  configFilename = 'tailwind.config.js',
) {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-config-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  const configFile = path.join(root, configFilename)
  const cssEntry = path.join(root, 'styles', 'app.css')
  const configImport = path.relative(path.dirname(cssEntry), configFile).replaceAll(path.sep, '/')

  await mkdir(path.dirname(cssEntry), { recursive: true })
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcss4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  await writeFile(configFile, configSource, 'utf8')
  for (const [file, content] of Object.entries(sources)) {
    const absoluteFile = path.join(root, file)
    await mkdir(path.dirname(absoluteFile), { recursive: true })
    await writeFile(absoluteFile, content, 'utf8')
  }

  return {
    css: [
      `@config "${configImport}";`,
      '@import "tailwindcss" source(none);',
      css,
      '',
    ].join('\n'),
    cssEntry,
  }
}

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ').trim()
}

describe('v5 Tailwind CSS v4 directives parity', () => {
  it('keeps target web output aligned with @tailwindcss/postcss for every v4 CSS-first directive', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const [officialResult, generatorResult] = await Promise.all([
      postcss([
        tailwindcssPostcss({
          optimize: false,
        }),
      ]).process(fixture.css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            target: 'web',
          },
        }),
      ]).process(fixture.css, {
        from: fixture.cssEntry,
      }),
    ])

    expect(generatorResult.css).toBe(officialResult.css)
    expect(generatorResult.messages).toContainEqual(expect.objectContaining({
      type: 'dependency',
      file: resolveSourceScanPath(fixture.sourceFile),
    }))
    expect(generatorResult.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'web',
    }))
  })

  it('keeps v4 directive semantics while converting target weapp output for mini-program CSS', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const result = await postcss([
      weappTailwindcss({
      }),
    ]).process(fixture.css, {
      from: fixture.cssEntry,
    })
    const normalized = normalizeCss(result.css)

    expect(result.css).toContain('.bg-source')
    expect(result.css).toContain('background-color: var(--color-source)')
    expect(result.css).not.toContain('ignored-source')
    expect(result.css).toContain('.bg-config')
    expect(result.css).toContain('background-color: #445566')
    expect(result.css).toContain('.plugin-card')
    expect(result.css).toContain('color: #778899')
    expect(result.css).toContain('.tab-8')
    expect(result.css).toContain('tab-size: 8')
    expect(result.css).toContain('.underline')
    expect(result.css).not.toContain('focus_cunderline')
    expect(result.css).toContain('.theme-midnight_cbg-brand')
    expect(result.css).toContain('.theme-dark')
    expect(result.css).not.toContain('[data-theme="midnight"]')
    expect(result.css).toContain('.card-shell')
    expect(result.css).toContain('border-radius: 18rpx')
    expect(result.css).toContain('padding-left: 32rpx')
    expect(result.css).toContain('padding-right: 32rpx')
    expect(result.css).toContain('.ref-card')
    expect(result.css).toContain('background-color: var(--color-reference)')
    expect(result.css).toContain('.variant-rule')
    expect(result.css).toContain('color: rgba(21, 93, 252, 0.5)')
    expect(result.css).toContain('margin: calc(var(--spacing) * 4)')
    expect(result.css).toContain('padding: 0.5rem')
    expect(normalized).not.toContain('@media (hover: hover)')
    expect(normalized).not.toContain('@media (any-hover: hover)')
    expect(normalized).not.toContain('@supports')
    expect(normalized).not.toContain(':hover')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'dependency',
      file: resolveSourceScanPath(fixture.sourceFile),
    }))
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'weapp',
    }))
  })

  it('keeps target tailwind as the raw Tailwind v4 output before mini-program transforms', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'tailwind',
        },
      }),
    ]).process(fixture.css, {
      from: fixture.cssEntry,
    })
    const generatedMessage = result.messages.find(message =>
      message.type === 'weapp-tailwindcss:generated',
    )

    expect(result.css).toContain('.hover\\:underline')
    expect(result.css).toContain('@media (hover: hover)')
    expect(result.css).toContain('.theme-midnight\\:bg-brand')
    expect(result.css).not.toContain('.theme-midnight_cbg-brand')
    expect(generatedMessage).toEqual(expect.objectContaining({
      target: 'tailwind',
      rawCss: result.css,
    }))
  })

  it('supports explicit Tailwind v4 preflight subpath imports for web generator output', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const css = [
      '@layer theme, base, components, utilities;',
      '@import "tailwindcss/theme.css" layer(theme);',
      '@import "tailwindcss/preflight.css" layer(base);',
      '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
      '@source inline("block border bg-red-500");',
      '',
    ].join('\n')
    const [officialResult, generatorResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])

    expect(generatorResult.css).toBe(officialResult.css)
    expect(generatorResult.css).toContain('@layer base')
    expect(generatorResult.css).toContain('box-sizing: border-box')
    expect(generatorResult.css).toContain('html, :host')
    expect(generatorResult.css).toContain('button, input, select, optgroup, textarea, ::file-selector-button')
    expect(generatorResult.css).toContain('.bg-red-500')
    expect(generatorResult.css).toContain('background-color: var(--color-red-500)')
  })

  it('drops Tailwind v4 preflight tag selectors from mini-program generator output', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const css = [
      '@layer theme, base, components, utilities;',
      '@import "tailwindcss/theme.css" layer(theme);',
      '@import "tailwindcss/preflight.css" layer(base);',
      '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
      '@source inline("block border bg-red-500");',
      '',
    ].join('\n')
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'weapp',
        },
      }),
    ]).process(css, {
      from: fixture.cssEntry,
    })

    expect(result.css).toContain('.bg-red-500')
    expect(result.css).toContain('background-color: var(--color-red-500)')
    expect(result.css).not.toContain('box-sizing: border-box')
    expect(result.css).not.toContain('html,')
    expect(result.css).not.toContain('button, input')
    expect(result.css).not.toContain('::file-selector-button')
  })

  it('keeps unlayered Tailwind v4 preflight subpath imports for web generator output', async () => {
    const fixture = await createTailwindV4DirectiveFixture()
    const css = [
      '@import "tailwindcss/preflight.css";',
      '@import "tailwindcss/utilities.css" source(none);',
      '@source inline("block");',
      '',
    ].join('\n')
    const [officialResult, generatorResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])

    expect(generatorResult.css).toBe(officialResult.css)
    expect(generatorResult.css).toContain('.block')
    expect(generatorResult.css).toContain('box-sizing: border-box')
    expect(generatorResult.css).toContain('html, :host')
    expect(generatorResult.css).toContain('button, input')
  })

  it('supports official adding-custom-styles features in v4 generator mode', async () => {
    const fixture = await createTailwindV4AddingCustomStylesFixture()
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(fixture.css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            target: 'web',
          },
        }),
      ]).process(fixture.css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
        }),
      ]).process(fixture.css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalized = normalizeCss(weappResult.css)

    expect(officialResult.css).toContain("--tw-content: 'hello_world'")
    expect(webResult.css).toContain("--tw-content: 'hello_world'")
    expect(webResult.css).toContain('.theme-midnight\\:bg-avocado-500')
    expect(webResult.css).toContain('aspect-ratio: 7/9')
    expect(webResult.css).not.toContain('@source')
    expect(webResult.css).not.toContain('@utility')
    expect(webResult.css).not.toContain('@custom-variant')
    expect(webResult.css).not.toContain('@variant')
    expect(weappResult.css).toContain('top: 117px')
    expect(weappResult.css).toContain('top: 344px')
    expect(weappResult.css).toContain('background-color: #bada55')
    expect(weappResult.css).toContain('font-size: 22px')
    expect(weappResult.css).toContain('--tw-content: \'Festivus\'')
    expect(weappResult.css).toContain('fill: var(--my-brand-color)')
    expect(weappResult.css).toContain('mask-type: luminance')
    expect(weappResult.css).toContain('--scroll-offset: 56px')
    expect(weappResult.css).toContain('--scroll-offset: 44px')
    expect(weappResult.css).toContain('grid-template-columns: 1fr 500px 2fr')
    expect(weappResult.css).toContain('/what_a_rush.png')
    expect(weappResult.css).toContain('--tw-content: \'hello_world\'')
    expect(weappResult.css).toContain('font-size: var(--my-var)')
    expect(weappResult.css).toContain('color: var(--my-color)')
    expect(weappResult.css).toContain('.card')
    expect(weappResult.css).toContain('padding: calc(var(--spacing) * 6)')
    expect(weappResult.css).toContain('.rounded-none')
    expect(weappResult.css).toContain('content-visibility: auto')
    expect(weappResult.css).toContain('display: none')
    expect(weappResult.css).toContain('tab-size: var(--tab-size-github)')
    expect(weappResult.css).toContain('tab-size: 76')
    expect(weappResult.css).toContain('tab-size: inherit')
    expect(weappResult.css).toContain('tab-size: 12')
    expect(weappResult.css).toContain('opacity: calc(42 * 1%)')
    expect(weappResult.css).toContain('opacity: 0.33')
    expect(weappResult.css).toContain('opacity: var(--opacity-soft)')
    expect(weappResult.css).toContain('top: calc(var(--spacing) * 4)')
    expect(weappResult.css).toContain('top: calc(var(--spacing) * -4)')
    expect(weappResult.css).toContain('top: 12px')
    expect(weappResult.css).toContain('top: calc(5% * -1)')
    expect(weappResult.css).toContain('font-size: var(--text-fluid)')
    expect(weappResult.css).toContain('line-height: var(--leading-tightish)')
    expect(weappResult.css).toContain('aspect-ratio: var(--aspect-ratio-retro)')
    expect(weappResult.css).toContain('aspect-ratio: 3/4')
    expect(weappResult.css).toContain('aspect-ratio: 7/9')
    expect(weappResult.css).toContain('.theme-midnight_cbg-avocado-500')
    expect(weappResult.css).toContain('.theme-dark')
    expect(weappResult.css).not.toContain('[data-theme="midnight"]')
    expect(weappResult.css).toContain('.my-element')
    expect(weappResult.css).not.toContain('@source')
    expect(weappResult.css).not.toContain('@utility')
    expect(weappResult.css).not.toContain('@custom-variant')
    expect(weappResult.css).not.toContain('@variant')
    expect(normalized).not.toContain('@media (hover: hover)')
    expect(normalized).not.toContain('@media (any-hover: hover)')
    expect(normalized).not.toContain(':hover')
  })

  it('covers supported @config legacy configuration options against the official postcss plugin', async () => {
    const supportedCases = [
      {
        name: 'theme extend and important true',
        config: [
          'export default {',
          '  important: true,',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '}',
        ].join('\n'),
        css: '@source inline("bg-brand");',
        weappAssertions: (css: string) => {
          expect(css).toContain('.bg-brand')
          expect(css).toContain('background-color: #123456 !important')
        },
      },
      {
        name: 'prefix variant',
        config: [
          'export default {',
          '  prefix: "tw",',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '}',
        ].join('\n'),
        css: '@source inline("tw:bg-brand bg-brand");',
        weappAssertions: (css: string) => {
          expect(css).toContain('.tw_cbg-brand')
          expect(css).toContain('background-color: #123456')
          expect(css).not.toContain('.bg-brand {')
        },
      },
      {
        name: 'content scan',
        config: [
          'export default {',
          '  content: ["./src/**/*.html"],',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '}',
        ].join('\n'),
        css: '',
        sources: {
          'src/page.html': '<div class="bg-brand"></div>',
        },
        weappAssertions: (css: string) => {
          expect(css).toContain('.bg-brand')
          expect(css).toContain('background-color: #123456')
        },
      },
      {
        name: 'content object files scan',
        config: [
          'export default {',
          '  content: { files: ["./src/**/*.html"] },',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '}',
        ].join('\n'),
        css: '',
        sources: {
          'src/page.html': '<div class="bg-brand"></div>',
        },
        weappAssertions: (css: string) => {
          expect(css).toContain('.bg-brand')
          expect(css).toContain('background-color: #123456')
        },
      },
      {
        name: 'presets merge',
        config: [
          'const preset = { theme: { extend: { colors: { preset: "#abcdef" } } } }',
          'export default {',
          '  presets: [preset],',
          '}',
        ].join('\n'),
        css: '@source inline("bg-preset");',
        weappAssertions: (css: string) => {
          expect(css).toContain('.bg-preset')
          expect(css).toContain('background-color: #abcdef')
        },
      },
      {
        name: 'plugin utilities variants and matchUtilities',
        config: [
          'export default {',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '  plugins: [',
          '    function ({ addUtilities, addVariant, matchUtilities, theme }) {',
          '      addUtilities({ ".config-plugin-card": { color: theme("colors.brand") } })',
          '      addVariant("config-hocus", "&:hover, &:focus")',
          '      matchUtilities({ "config-size": value => ({ width: value }) }, { values: { card: "42px" } })',
          '    },',
          '  ],',
          '}',
        ].join('\n'),
        css: '@source inline("config-plugin-card config-hocus:bg-brand config-size-card");',
        weappAssertions: (css: string) => {
          expect(css).toContain('.config-plugin-card')
          expect(css).toContain('color: #123456')
          expect(css).toContain('.config-size-card')
          expect(css).toContain('width: 42px')
          expect(css).toContain('.config-hocus_cbg-brand:focus')
          expect(css).toContain('background-color: #123456')
          expect(css).not.toContain(':hover')
        },
      },
    ] satisfies Array<{
      name: string
      config: string
      css: string
      sources?: Record<string, string>
      weappAssertions: (css: string) => void
    }>

    for (const item of supportedCases) {
      const fixture = await createTailwindV4ConfigFixture(item.config, item.css, item.sources)
      const [officialResult, webResult, weappResult] = await Promise.all([
        postcss([tailwindcssPostcss({ optimize: false })]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
        postcss([
          weappTailwindcss({
            generator: {
              target: 'web',
            },
          }),
        ]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
        postcss([
          weappTailwindcss({
          }),
        ]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
      ])

      expect(webResult.css, item.name).toBe(officialResult.css)
      item.weappAssertions(weappResult.css)
      expect(webResult.messages).toContainEqual(expect.objectContaining({
        type: 'weapp-tailwindcss:generated',
        target: 'web',
      }))
      expect(weappResult.messages).toContainEqual(expect.objectContaining({
        type: 'weapp-tailwindcss:generated',
        target: 'weapp',
      }))
    }
  })

  it('loads @config legacy JavaScript, CommonJS, ESM, and TypeScript config files', async () => {
    const configCases = [
      {
        name: 'js',
        filename: 'tailwind.config.js',
        config: [
          'export default {',
          '  theme: { extend: { colors: { js: "#123456" } } },',
          '}',
        ].join('\n'),
        candidate: 'bg-js',
        expected: 'background-color: #123456',
      },
      {
        name: 'cjs',
        filename: 'tailwind.config.cjs',
        config: [
          'module.exports = {',
          '  theme: { extend: { colors: { cjs: "#234567" } } },',
          '}',
        ].join('\n'),
        candidate: 'bg-cjs',
        expected: 'background-color: #234567',
      },
      {
        name: 'mjs',
        filename: 'tailwind.config.mjs',
        config: [
          'export default {',
          '  theme: { extend: { colors: { mjs: "#345678" } } },',
          '}',
        ].join('\n'),
        candidate: 'bg-mjs',
        expected: 'background-color: #345678',
      },
      {
        name: 'ts',
        filename: 'tailwind.config.ts',
        config: [
          'export default {',
          '  theme: { extend: { colors: { ts: "#456789" } } },',
          '}',
        ].join('\n'),
        candidate: 'bg-ts',
        expected: 'background-color: #456789',
      },
    ]

    for (const item of configCases) {
      const fixture = await createTailwindV4ConfigFixture(
        item.config,
        `@source inline("${item.candidate}");`,
        {},
        item.filename,
      )
      const [officialResult, generatorResult] = await Promise.all([
        postcss([tailwindcssPostcss({ optimize: false })]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
        postcss([
          weappTailwindcss({
            generator: {
              target: 'web',
            },
          }),
        ]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
      ])

      expect(generatorResult.css, item.name).toBe(officialResult.css)
      expect(generatorResult.css).toContain(`.${item.candidate}`)
      expect(generatorResult.css).toContain(item.expected)
    }
  })

  it('pins @config raw content as unsupported by Tailwind CSS v4', async () => {
    const fixture = await createTailwindV4ConfigFixture(
      [
        'export default {',
        '  content: [{ raw: \'<div class="bg-brand"></div>\', extension: "html" }],',
        '  theme: { extend: { colors: { brand: "#123456" } } },',
        '}',
      ].join('\n'),
      '',
    )
    const processOfficial = postcss([tailwindcssPostcss({ optimize: false })]).process(fixture.css, {
      from: fixture.cssEntry,
    })
    const processGenerator = postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
      }),
    ]).process(fixture.css, {
      from: fixture.cssEntry,
    })

    await expect(processOfficial).rejects.toThrow('raw')
    await expect(processGenerator).rejects.toThrow('raw')
  })

  it('pins @config options that Tailwind CSS v4 intentionally does not support', async () => {
    const unsupportedCases = [
      {
        name: 'safelist',
        config: [
          'export default {',
          '  safelist: ["bg-brand"],',
          '  theme: { extend: { colors: { brand: "#123456" } } },',
          '}',
        ].join('\n'),
        css: '',
        absent: '.bg-brand',
      },
      {
        name: 'corePlugins',
        config: [
          'export default {',
          '  corePlugins: { display: false },',
          '}',
        ].join('\n'),
        css: '@source inline("block");',
        present: '.block',
      },
      {
        name: 'separator',
        config: [
          'export default {',
          '  separator: "_",',
          '}',
        ].join('\n'),
        css: '@source inline("hover_block hover:block");',
        present: '.hover\\:block',
        absent: 'hover_block',
      },
    ]

    for (const item of unsupportedCases) {
      const fixture = await createTailwindV4ConfigFixture(item.config, item.css)
      const [officialResult, generatorResult] = await Promise.all([
        postcss([tailwindcssPostcss({ optimize: false })]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
        postcss([
          weappTailwindcss({
            generator: {
              target: 'web',
            },
          }),
        ]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
      ])

      expect(generatorResult.css, item.name).toBe(officialResult.css)
      if ('present' in item && item.present) {
        expect(generatorResult.css).toContain(item.present)
      }
      if ('absent' in item && item.absent) {
        expect(generatorResult.css).not.toContain(item.absent)
      }
    }
  })
})
