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

const TAILWIND_V3_COLOR_CASES = [
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
  it('keeps target web aligned with native Tailwind v4 defaults unless Tailwind v3 compatibility is explicitly enabled', async () => {
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

  it('restores Tailwind v3 default values for explicit web generator compatibility output', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      tailwindcssV3Compatibility: true,
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

  it('uses Tailwind v3 compatibility defaults and colors for mini-program generator output by default', async () => {
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
      @source inline("${TAILWIND_V3_COLOR_CASES.map(([candidate]) => candidate).join(' ')}");
    `, {
      mode: 'force',
      target: 'weapp',
    })

    for (const [candidate, declaration] of TAILWIND_V3_COLOR_CASES) {
      const className = candidate.replace('bg-', '.bg-')
      expect(result.css).toContain(declaration)
      expect(result.css).toContain(className)
    }
    expect(result.css).not.toContain('oklch(')
  })

  it('supports Tailwind v4 color utilities and color theme APIs in generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @theme {
        --color-bermuda: #78dcca;
      }
      @source inline("text-blue-600 bg-sky-500/75 bg-sky-500/[.33] bg-sky-500/(--my-alpha-value) border-pink-400 divide-orange-300 outline-red-500 decoration-purple-500 accent-green-600 caret-rose-500 fill-bermuda stroke-cyan-400 shadow-blue-500/50 inset-shadow-indigo-500 ring-fuchsia-500 placeholder-zinc-500 dark:bg-gray-800 text-[color:var(--brand-color)] bg-[color:var(--surface-color)]");
      .color-api {
        color: var(--color-blue-600);
        background-color: --alpha(var(--color-sky-500) / 50%);
      }
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalizedWeappCss = normalizeCss(weappResult.css)

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain('background-color: color-mix(in oklab, var(--color-sky-500) 75%, transparent)')
    expect(webResult.css).toContain('background-color: color-mix(in oklab, var(--color-sky-500) 33%, transparent)')
    expect(webResult.css).toContain('background-color: color-mix(in oklab, var(--color-sky-500) var(--my-alpha-value), transparent)')
    expect(webResult.css).toContain('color: color-mix(in oklab, var(--color-sky-500) 50%, transparent)')
    expect(webResult.css).toContain('--color-bermuda: #78dcca')
    expect(webResult.css).not.toContain('@source')

    expect(weappResult.css).toContain('--color-bermuda: #78dcca')
    expect(weappResult.css).toContain('color: var(--color-blue-600)')
    expect(weappResult.css).toContain('background-color: rgba(14, 165, 233, 0.5)')
    expect(weappResult.css).toContain('color: var(--color-blue-600)')
    expect(weappResult.css).toContain('background-color: rgba(14, 165, 233, 0.75)')
    expect(weappResult.css).toContain('background-color: rgba(14, 165, 233, 0.33)')
    expect(weappResult.css).toContain('background-color: color-mix(in oklab, var(--color-sky-500) var(--my-alpha-value), transparent)')
    expect(weappResult.css).toContain('border-color: var(--color-pink-400)')
    expect(weappResult.css).toContain('border-color: var(--color-orange-300)')
    expect(weappResult.css).toContain('outline-color: var(--color-red-500)')
    expect(weappResult.css).toContain('text-decoration-color: var(--color-purple-500)')
    expect(weappResult.css).toContain('accent-color: var(--color-green-600)')
    expect(weappResult.css).toContain('caret-color: var(--color-rose-500)')
    expect(weappResult.css).toContain('fill: var(--color-bermuda)')
    expect(weappResult.css).toContain('stroke: var(--color-cyan-400)')
    expect(weappResult.css).toContain('--tw-shadow-color: rgba(59, 130, 246, 0.5)')
    expect(weappResult.css).toContain('--tw-inset-shadow-color: #6366f1')
    expect(weappResult.css).toContain('--tw-ring-color: var(--color-fuchsia-500)')
    expect(weappResult.css).toContain('color: var(--color-zinc-500)')
    expect(weappResult.css).toContain('color: var(--brand-color)')
    expect(weappResult.css).toContain('background-color: var(--surface-color)')
    expect(weappResult.css).toContain('background-color: var(--color-gray-800)')
    expect(normalizedWeappCss).toContain('@media (prefers-color-scheme: dark)')
    expect(normalizedWeappCss).not.toContain('@source')
  })

  it('supports Tailwind v4 dark mode variants in generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @theme {
        --color-white: #fff;
        --color-gray-100: #f3f4f6;
        --color-gray-900: #111827;
        --color-slate-900: #0f172a;
        --color-blue-500: #3b82f6;
      }
      @source inline("bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100");
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            tailwindcssV3Compatibility: false,
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalizedWeappCss = normalizeCss(weappResult.css)

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain('@media (prefers-color-scheme: dark)')
    expect(webResult.css).toContain('background-color: var(--color-gray-900)')
    expect(webResult.css).toContain('color: var(--color-gray-100)')
    expect(webResult.css).not.toContain('@source')

    expect(weappResult.css).toContain('background-color: var(--color-white)')
    expect(weappResult.css).toContain('color: var(--color-gray-900)')
    expect(weappResult.css).toContain('background-color: var(--color-gray-900)')
    expect(weappResult.css).toContain('color: var(--color-gray-100)')
    expect(normalizedWeappCss).toContain('@media (prefers-color-scheme: dark)')
    expect(normalizedWeappCss).not.toContain('@source')
  })

  it('supports Tailwind v4 dark mode custom selector variants in generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @custom-variant dark (&:where(.dark, .dark *));
      @theme {
        --color-white: #fff;
        --color-gray-900: #111827;
        --color-indigo-500: #6366f1;
      }
      @source inline("bg-white dark:bg-gray-900 dark:[&_.label]:text-indigo-500");
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            tailwindcssV3Compatibility: false,
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalizedWeappCss = normalizeCss(weappResult.css)

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain(':where(.dark, .dark *)')
    expect(webResult.css).toContain('background-color: var(--color-gray-900)')
    expect(webResult.css).toContain('color: var(--color-indigo-500)')

    expect(weappResult.css).toContain('background-color: var(--color-white)')
    expect(weappResult.css).toContain('background-color: var(--color-gray-900)')
    expect(weappResult.css).toContain('color: var(--color-indigo-500)')
    expect(normalizedWeappCss).toContain(':where(.dark,.dark view)')
    expect(normalizedWeappCss).toContain(':where(.dark,.dark text)')
    expect(normalizedWeappCss).not.toContain('@custom-variant')
    expect(normalizedWeappCss).not.toContain('@source')
  })

  it('supports Tailwind v4 dark mode data attribute variants in generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
      @theme {
        --color-white: #fff;
        --color-zinc-950: #09090b;
      }
      @source inline("bg-white dark:bg-zinc-950");
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            tailwindcssV3Compatibility: false,
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalizedWeappCss = normalizeCss(weappResult.css)

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain(':where([data-theme=dark], [data-theme=dark] *)')
    expect(webResult.css).toContain('background-color: var(--color-zinc-950)')

    expect(weappResult.css).toContain('background-color: var(--color-white)')
    expect(weappResult.css).toContain('background-color: var(--color-zinc-950)')
    expect(normalizedWeappCss).toContain(':where([data-theme=dark],[data-theme=dark] view)')
    expect(normalizedWeappCss).toContain(':where([data-theme=dark],[data-theme=dark] text)')
    expect(normalizedWeappCss).not.toContain('@custom-variant')
    expect(normalizedWeappCss).not.toContain('@source')
  })

  it('supports disabling default colors and declaring custom palettes in v4 generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @theme {
        --color-*: initial;
        --color-midnight: #121063;
        --color-tahiti: #3ab7bf;
        --color-bermuda: #78dcca;
      }
      @source inline("bg-midnight text-tahiti fill-bermuda bg-red-500");
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain('--color-midnight: #121063')
    expect(webResult.css).toContain('--color-tahiti: #3ab7bf')
    expect(webResult.css).toContain('--color-bermuda: #78dcca')
    expect(webResult.css).toContain('.bg-midnight')
    expect(webResult.css).toContain('.text-tahiti')
    expect(webResult.css).toContain('.fill-bermuda')
    expect(webResult.css).not.toContain('.bg-red-500')

    expect(weappResult.css).toContain('--color-midnight: #121063')
    expect(weappResult.css).toContain('--color-tahiti: #3ab7bf')
    expect(weappResult.css).toContain('--color-bermuda: #78dcca')
    expect(weappResult.css).toContain('background-color: var(--color-midnight)')
    expect(weappResult.css).toContain('color: var(--color-tahiti)')
    expect(weappResult.css).toContain('fill: var(--color-bermuda)')
    expect(weappResult.css).not.toContain('.bg-red-500')
  })

  it('supports Tailwind v4 theme namespaces and keyframes in generator mode', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @theme {
        --font-script: Great Vibes, cursive;
        --text-tiny: 0.625rem;
        --font-weight-extra: 1000;
        --tracking-tightest: -0.08em;
        --leading-extra-loose: 2.5;
        --breakpoint-3xl: 120rem;
        --container-card: 42rem;
        --spacing-card: 22px;
        --radius-panel: 1.25rem;
        --shadow-brand: 0 10px 20px rgb(0 0 0 / 0.15);
        --inset-shadow-brand: inset 0 2px 8px rgb(0 0 0 / 0.2);
        --drop-shadow-brand: 0 4px 8px rgb(0 0 0 / 0.25);
        --blur-soft: 2px;
        --perspective-wide: 1200px;
        --aspect-retro: 4 / 3;
        --ease-spring: cubic-bezier(.2, .8, .2, 1);
        --animate-fade-in-scale: fade-in-scale .3s ease-out;
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      }
      @source inline("font-script text-tiny font-extra tracking-tightest leading-extra-loose 3xl:grid-cols-6 @card:flex w-card max-w-card p-card rounded-panel shadow-brand inset-shadow-brand drop-shadow-brand blur-soft perspective-wide aspect-retro ease-spring animate-fade-in-scale grid grid-cols-2 transition");
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            tailwindcssV3Compatibility: false,
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])
    const normalizedWeappCss = normalizeCss(weappResult.css)

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain('font-family: var(--font-script)')
    expect(webResult.css).toContain('@media (width >= 120rem)')
    expect(webResult.css).toContain('@container (width >= 42rem)')
    expect(webResult.css).toContain('animation: var(--animate-fade-in-scale)')
    expect(webResult.css).toContain('@keyframes fade-in-scale')

    expect(weappResult.css).toContain('--font-script: Great Vibes, cursive')
    expect(weappResult.css).toContain('font-family: var(--font-script)')
    expect(weappResult.css).toContain('font-size: var(--text-tiny)')
    expect(weappResult.css).toContain('font-weight: var(--font-weight-extra)')
    expect(weappResult.css).toContain('letter-spacing: var(--tracking-tightest)')
    expect(weappResult.css).toContain('line-height: var(--leading-extra-loose)')
    expect(weappResult.css).toContain('width: var(--spacing-card)')
    expect(weappResult.css).toContain('max-width: var(--spacing-card)')
    expect(weappResult.css).toContain('padding: var(--spacing-card)')
    expect(weappResult.css).toContain('border-radius: var(--radius-panel)')
    expect(weappResult.css).toContain('--tw-shadow: 0 10px 20px var(--tw-shadow-color, rgba(0, 0, 0, 0.15))')
    expect(weappResult.css).toContain('--tw-inset-shadow: inset 0 2px 8px var(--tw-inset-shadow-color, rgba(0, 0, 0, 0.2))')
    expect(weappResult.css).toContain('--tw-drop-shadow: drop-shadow(var(--drop-shadow-brand))')
    expect(weappResult.css).toContain('--tw-blur: blur(var(--blur-soft))')
    expect(weappResult.css).toContain('perspective: var(--perspective-wide)')
    expect(weappResult.css).toContain('aspect-ratio: var(--aspect-retro)')
    expect(weappResult.css).toContain('--tw-ease: var(--ease-spring)')
    expect(weappResult.css).toContain('animation: var(--animate-fade-in-scale)')
    expect(weappResult.css).toContain('@keyframes fade-in-scale')
    expect(normalizedWeappCss).toContain('@media (min-width: 120rem)')
    expect(normalizedWeappCss).toContain('@container (width >= 42rem)')
    expect(normalizedWeappCss).not.toContain('@theme')
    expect(normalizedWeappCss).not.toContain('@source')
  })

  it('supports custom theme reset, inline variables, static variables, and theme variable references', async () => {
    const fixture = await createFixtureBase()
    const css = `
      @import "tailwindcss" source(none);
      @theme {
        --*: initial;
        --spacing: 4px;
        --font-body: Inter, sans-serif;
        --color-lagoon: #123456;
        --color-dusk: #abcdef;
        --radius-xl: 1rem;
      }
      @theme inline {
        --font-sans: var(--font-inter);
      }
      @theme static {
        --color-primary: var(--color-lagoon);
        --color-secondary: var(--color-dusk);
      }
      @source inline("font-body font-sans text-dusk bg-lagoon p-4 rounded-[calc(var(--radius-xl)-1px)] bg-red-500 font-mono");
      .theme-card {
        color: var(--color-dusk);
        border-radius: calc(var(--radius-xl) - 1px);
      }
    `
    const [officialResult, webResult, weappResult] = await Promise.all([
      postcss([tailwindcssPostcss({ optimize: false })]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            target: 'web',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
      postcss([
        weappTailwindcss({
          generator: {
            mode: 'force',
            tailwindcssV3Compatibility: false,
            target: 'weapp',
          },
        }),
      ]).process(css, {
        from: fixture.cssEntry,
      }),
    ])

    expect(webResult.css).toBe(officialResult.css)
    expect(webResult.css).toContain('--color-primary: var(--color-lagoon)')
    expect(webResult.css).toContain('--color-secondary: var(--color-dusk)')
    expect(webResult.css).toContain('font-family: var(--font-inter)')
    expect(webResult.css).toContain('.font-body')
    expect(webResult.css).toContain('.text-dusk')
    expect(webResult.css).toContain('.bg-lagoon')
    expect(webResult.css).not.toContain('.bg-red-500')
    expect(webResult.css).not.toContain('.font-mono')

    expect(weappResult.css).toContain('--spacing: 4px')
    expect(weappResult.css).toContain('--font-body: Inter, sans-serif')
    expect(weappResult.css).toContain('--color-lagoon: #123456')
    expect(weappResult.css).toContain('--color-dusk: #abcdef')
    expect(weappResult.css).toContain('--color-primary: var(--color-lagoon)')
    expect(weappResult.css).toContain('--color-secondary: var(--color-dusk)')
    expect(weappResult.css).toContain('font-family: var(--font-body)')
    expect(weappResult.css).toContain('font-family: var(--font-inter)')
    expect(weappResult.css).toContain('color: var(--color-dusk)')
    expect(weappResult.css).toContain('background-color: var(--color-lagoon)')
    expect(weappResult.css).toContain('padding: calc(var(--spacing) * 4)')
    expect(weappResult.css).toContain('border-radius: calc(var(--radius-xl) - 1px)')
    expect(weappResult.css).not.toContain('.bg-red-500')
    expect(weappResult.css).not.toContain('.font-mono')
    expect(weappResult.css).not.toContain('@theme')
    expect(weappResult.css).not.toContain('@source')
  })

  it('can opt mini-program generator output into native Tailwind v4 defaults', async () => {
    const result = await generate(UPGRADE_DEFAULTS_SOURCE_CSS, {
      mode: 'force',
      tailwindcssV3Compatibility: false,
      target: 'weapp',
    })

    expect(result.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('var(--tw-ring-color, currentcolor)')
    expect(result.css).toContain('outline-width: 1px')
    expect(result.css).toContain('--color-red-500: #fb2c36')
    expect(result.css).toContain('--color-slate-700: #314158')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1))')
    expect(result.css).toContain('border-radius: var(--radius-sm)')
    expect(result.css).toContain('--tw-blur: blur(var(--blur-sm))')
    expect(result.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).not.toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).not.toContain('.shadow-sm {\n    --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.05))')
    expect(result.css).not.toContain('oklch(')
  })

  it('keeps user-defined theme colors ahead of Tailwind v3 compatibility color defaults', async () => {
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
