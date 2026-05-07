import { mkdir, mkdtemp, symlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import weappTailwindcss from '@/postcss'

const require = createRequire(import.meta.url)
const tailwindcss4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

const UPGRADE_DEFAULTS_CSS = `
@import "tailwindcss" source(none);
@theme default {
  --color-blue-500: #3b82f6;
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --spacing: 0.25rem;
}
`

const UPGRADE_DEFAULTS_CANDIDATES = [
  'bg-red-500',
  'text-slate-700',
  'border-gray-200',
  'ring-blue-500',
  'border',
  'ring',
  'outline',
  'shadow',
  'shadow-sm',
  'shadow-xs',
  'drop-shadow',
  'drop-shadow-sm',
  'drop-shadow-xs',
  'rounded',
  'rounded-sm',
  'rounded-xs',
  'blur',
  'blur-sm',
  'blur-xs',
  'backdrop-blur',
  'backdrop-blur-sm',
  'backdrop-blur-xs',
]

const UPGRADE_DEFAULTS_SOURCE_CSS = `${UPGRADE_DEFAULTS_CSS}@source inline("${UPGRADE_DEFAULTS_CANDIDATES.join(' ')}");`

const LEGACY_COLOR_CASES = [
  ['bg-slate-50', '--color-slate-50: #f8fafc'],
  ['bg-gray-950', '--color-gray-950: #030712'],
  ['bg-zinc-500', '--color-zinc-500: #71717a'],
  ['bg-neutral-700', '--color-neutral-700: #404040'],
  ['bg-stone-400', '--color-stone-400: #a8a29e'],
  ['bg-red-500', '--color-red-500: #ef4444'],
  ['bg-orange-600', '--color-orange-600: #ea580c'],
  ['bg-amber-300', '--color-amber-300: #fcd34d'],
  ['bg-yellow-800', '--color-yellow-800: #854d0e'],
  ['bg-lime-200', '--color-lime-200: #d9f99d'],
  ['bg-green-900', '--color-green-900: #14532d'],
  ['bg-emerald-100', '--color-emerald-100: #d1fae5'],
  ['bg-teal-950', '--color-teal-950: #042f2e'],
  ['bg-cyan-400', '--color-cyan-400: #22d3ee'],
  ['bg-sky-700', '--color-sky-700: #0369a1'],
  ['bg-blue-500', '--color-blue-500: #3b82f6'],
  ['bg-indigo-300', '--color-indigo-300: #a5b4fc'],
  ['bg-violet-800', '--color-violet-800: #5b21b6'],
  ['bg-purple-600', '--color-purple-600: #9333ea'],
  ['bg-fuchsia-200', '--color-fuchsia-200: #f5d0fe'],
  ['bg-pink-900', '--color-pink-900: #831843'],
  ['bg-rose-50', '--color-rose-50: #fff1f2'],
] as const

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ').trim()
}

async function createFixtureBase() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-upgrade-generator-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcss4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  return {
    cssEntry: path.join(root, 'app.css'),
  }
}

async function generate(css: string, generator: NonNullable<Parameters<typeof weappTailwindcss>[0]>['generator']) {
  const fixture = await createFixtureBase()
  return postcss([
    weappTailwindcss({
      generator,
    }),
  ]).process(css, {
    from: fixture.cssEntry,
  })
}

describe('v5 Tailwind CSS v4 upgrade generator coverage', () => {
  it('keeps target web aligned with native Tailwind v4 defaults unless legacy defaults are explicitly enabled', async () => {
    const fixture = await createFixtureBase()
    const [officialResult, generatorResult] = await Promise.all([
      postcss([
        tailwindcssPostcss({
          optimize: false,
        }),
      ]).process(UPGRADE_DEFAULTS_SOURCE_CSS, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(UPGRADE_DEFAULTS_SOURCE_CSS, {
        from: fixture.cssEntry,
      }),
    ])

    expect(generatorResult.css).toBe(officialResult.css)
    expect(generatorResult.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(generatorResult.css).toContain('var(--tw-ring-color, currentcolor)')
    expect(generatorResult.css).toContain('outline-width: 1px')
    expect(generatorResult.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
    expect(generatorResult.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))')
    expect(generatorResult.css).toContain('--radius-sm: 0.25rem')
    expect(generatorResult.css).toContain('--blur-sm: 8px')
    expect(generatorResult.css).toContain('color: color-mix(in oklab, currentcolor 50%, transparent)')
    expect(generatorResult.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(generatorResult.css).not.toContain('cursor: pointer')
  })

  it('keeps postcss generator web target aligned with native Tailwind v4 defaults without scanning workspace fixtures', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      target: 'web',
    })

    expect(result.css).toContain('.ring')
    expect(result.css).toContain('.border')
    expect(result.css).not.toContain('.w-\\[100px\\]')
  })

  it('restores Tailwind v3 default values for explicit legacy web generator output', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      legacyDefaults: true,
      target: 'web',
    })

    expect(result.css).toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('color: var(--color-gray-400, currentcolor)')
    expect(result.css).toContain('--color-red-500: #ef4444')
    expect(result.css).toContain('--color-slate-700: #334155')
    expect(result.css).toContain('cursor: pointer')
    expect(result.css).toContain('dialog')
    expect(result.css).toContain('margin: auto')
    expect(result.css).not.toContain(':not(#n)')
    expect(result.css).not.toContain(':not(#\\#)')
    expect(result.css).toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('var(--tw-ring-color, var(--color-blue-500, #3b82f6))')
    expect(result.css).toContain('outline-width: 3px')
    expect(result.css).toContain('--tw-shadow: 0 1px var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))')
    expect(result.css).toContain('--drop-shadow-xs: 0 1px 1px rgb(0 0 0 / 0.05)')
    expect(result.css).toContain('--drop-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.15)')
    expect(result.css).toContain('--radius-sm: 0.125rem')
    expect(result.css).toContain('--radius: 0.25rem')
    expect(result.css).toContain('--blur-sm: 4px')
    expect(result.css).toContain('--blur: 8px')
    expect(result.css).toContain('--backdrop-blur-sm: 4px')
    expect(result.css).not.toContain('--shadow-2xs')
    expect(result.css).not.toContain('oklch(')
  })

  it('uses legacy defaults and Tailwind v3 colors for mini-program generator output by default', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      target: 'weapp',
    })
    const normalized = normalizeCss(result.css)

    expect(result.css).toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('var(--tw-ring-color, var(--color-blue-500, #3b82f6))')
    expect(result.css).toContain('outline-width: 3px')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.05))')
    expect(result.css).toContain('--color-red-500: #ef4444')
    expect(result.css).toContain('--color-slate-700: #334155')
    expect(result.css).toContain('background-color: var(--color-red-500)')
    expect(result.css).toContain('color: var(--color-slate-700)')
    expect(result.css).toContain('border-color: var(--color-gray-200)')
    expect(result.css).toContain('var(--tw-ring-color, var(--color-blue-500, #3b82f6))')
    expect(result.css).toContain('border-radius: var(--radius-sm)')
    expect(result.css).toContain('--tw-blur: blur(var(--blur-sm))')
    expect(result.css).toContain('--tw-backdrop-blur: blur(var(--backdrop-blur-sm))')
    expect(result.css).not.toContain('color-mix(in oklab, currentcolor 50%, transparent)')
    expect(result.css).not.toContain('input::placeholder')
    expect(result.css).not.toContain('textarea::placeholder')
    expect(result.css).not.toContain('cursor: pointer')
    expect(result.css).not.toContain('dialog')
    expect(result.css).not.toContain(':not(#n)')
    expect(result.css).not.toContain(':not(#\\#)')
    expect(result.css).not.toContain('oklch(')
    expect(normalized).not.toContain('@supports')
  })

  it('emits mini-program-safe Tailwind v3 default colors across the default palette', async () => {
    const result = await generate(`
      @import "tailwindcss" source(none);
      @source inline("${LEGACY_COLOR_CASES.map(([candidate]) => candidate).join(' ')}");
    `, {
      mode: 'force',
      target: 'weapp',
    })

    for (const [candidate, declaration] of LEGACY_COLOR_CASES) {
      const className = candidate.replace('bg-', '.bg-')
      expect(result.css).toContain(declaration)
      expect(result.css).toContain(className)
    }
    expect(result.css).not.toContain('oklch(')
  })

  it('can opt mini-program generator output into native Tailwind v4 defaults', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      legacyDefaults: false,
      target: 'weapp',
    })

    expect(result.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('var(--tw-ring-color, currentcolor)')
    expect(result.css).toContain('outline-width: 1px')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1))')
    expect(result.css).toContain('border-radius: var(--radius-sm)')
    expect(result.css).toContain('--tw-blur: blur(var(--blur-sm))')
    expect(result.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).not.toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).not.toContain('.shadow-sm {\n    --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.05))')
  })

  it('keeps user-defined theme colors ahead of legacy Tailwind v3 color defaults', async () => {
    const result = await generate(`
      @import "tailwindcss" source(none);
      @theme {
        --color-red-500: #123456;
      }
      @source inline("bg-red-500 text-blue-500");
    `, {
      mode: 'force',
      target: 'weapp',
    })

    expect(result.css).toContain('--color-red-500: #123456')
    expect(result.css).toContain('--color-blue-500: #3b82f6')
    expect(result.css).toContain('background-color: var(--color-red-500)')
    expect(result.css).toContain('color: var(--color-blue-500)')
    expect(result.css).not.toContain('oklch(')
  })

  it('transforms Tailwind v4 space and divide child selectors into mini-program-safe sibling combinations', async () => {
    const result = await generate(`
      @import "tailwindcss" source(none);
      @theme default {
        --spacing: 0.25rem;
      }
      @theme {
        --color-red-500: #fb2c36;
      }
      @source inline("space-y-4 space-y-reverse divide-y divide-y-4 divide-y-reverse divide-dashed divide-red-500");
    `, {
      mode: 'force',
      target: 'weapp',
    })
    const css = normalizeCss(result.css)

    for (const selector of [
      '.space-y-4>view+view',
      '.space-y-4>view+text',
      '.space-y-4>text+view',
      '.space-y-4>text+text',
      '.divide-y>view+view',
      '.divide-y>view+text',
      '.divide-y>text+view',
      '.divide-y>text+text',
      '.divide-dashed>view+view',
      '.divide-red-500>text+text',
    ]) {
      expect(css).toContain(selector)
    }
    expect(css).toContain('--tw-space-y-reverse: 1')
    expect(css).toContain('--tw-divide-y-reverse: 1')
    expect(css).not.toContain(':not(:last-child)')
    expect(css).not.toContain(':not([hidden])')
  })

  it('keeps upgrade-guide syntax changes compatible with exact generator candidates', async () => {
    const result = await generate(`
      @import "tailwindcss" prefix(tw) source(none);
      @theme default {
        --color-brand: #123456;
        --spacing: 0.25rem;
      }
      @source inline("tw:hover:!bg-brand tw:w-(--card-width) tw:before:content-['']");
    `, {
      mode: 'force',
      target: 'weapp',
    })
    const generatedMessage = result.messages.find(message =>
      message.type === 'weapp-tailwindcss:generated',
    )
    const rawCss = (generatedMessage as { rawCss?: string } | undefined)?.rawCss

    expect(rawCss).toContain('.tw\\:hover\\:\\!bg-brand')
    expect(rawCss).toContain('@media (hover: hover)')
    expect(rawCss).toContain('background-color: var(--tw-color-brand) !important')
    expect(result.css).not.toContain('background-color: #123456 !important')
    expect(result.css).toContain('.tw_cw-_p--card-width_P')
    expect(result.css).toContain('width: var(--card-width)')
    expect(result.css).toContain('.tw_cbefore_ccontent-_b_a_a_B')
    expect(result.css).toContain('--tw-content: \'\'')
    expect(result.css).not.toContain('.hover_c_xbg-brand')
    expect(result.css).not.toContain('.w-_p--card-width_P')
    expect(result.css).not.toContain(':hover')
    expect(result.css).not.toContain('@media (hover: hover)')
  })
})
