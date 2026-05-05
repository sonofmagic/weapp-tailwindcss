import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import weappTailwindcss from '@/postcss'

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
    '@custom-variant theme-midnight (&:where([data-theme="midnight"] *));',
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
            mode: 'force',
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
      file: fixture.sourceFile,
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
        generator: {
          mode: 'force',
          target: 'weapp',
        },
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
    expect(result.css).toContain('.theme-midnight_cbg-brand:where(view)')
    expect(result.css).toContain('.theme-midnight_cbg-brand:where(text)')
    expect(result.css).toContain('.card-shell')
    expect(result.css).toContain('border-radius: 18rpx')
    expect(result.css).toContain('padding-left: 32rpx')
    expect(result.css).toContain('padding-right: 32rpx')
    expect(result.css).toContain('.ref-card')
    expect(result.css).toContain('background-color: var(--color-reference)')
    expect(result.css).toContain('.variant-rule:where(view)')
    expect(result.css).toContain('.variant-rule:where(text)')
    expect(result.css).toContain('color: rgba(21, 93, 252, 0.5)')
    expect(result.css).toContain('margin: calc(var(--spacing) * 4)')
    expect(result.css).toContain('padding: 0.5rem')
    expect(normalized).not.toContain('@media (hover: hover)')
    expect(normalized).not.toContain('@media (any-hover: hover)')
    expect(normalized).not.toContain('@supports')
    expect(normalized).not.toContain(':hover')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'dependency',
      file: fixture.sourceFile,
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
          mode: 'force',
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
              mode: 'force',
              target: 'web',
            },
          }),
        ]).process(fixture.css, {
          from: fixture.cssEntry,
        }),
        postcss([
          weappTailwindcss({
            generator: {
              mode: 'force',
              target: 'weapp',
            },
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
              mode: 'force',
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
          mode: 'force',
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
              mode: 'force',
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
