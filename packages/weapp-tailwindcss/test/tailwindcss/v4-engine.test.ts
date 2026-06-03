import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { TailwindCssPatchOptions } from 'tailwindcss-patch'
import { resolveTailwindV4SourceFromPatchOptions } from 'tailwindcss-patch'
import { afterEach, vi } from 'vitest'
import { createTailwindV4Engine, resolveTailwindV4Source, resolveTailwindV4SourceOptionsFromPatcher, transformTailwindV4CssToWeapp } from '@/tailwindcss/v4-engine'

const require = createRequire(import.meta.url)
const tailwindcssRoot = path.dirname(require.resolve('tailwindcss4/package.json'))

const MINIMAL_THEME_CSS = `
@theme default {
  --color-amber-200: oklch(92.4% 0.12 95.746);
  --color-red-500: oklch(63.7% 0.237 25.331);
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --color-orange-200: oklch(90.1% 0.076 70.697);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

async function linkTailwindcssPackage(root: string) {
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssRoot, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
}

describe('tailwindcss v4 engine', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates css and class set from explicit candidates', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['bg-red-500', 'w-[100px]', 'not-a-tailwind-class'],
    })

    expect(result.classSet).toEqual(new Set(['bg-red-500', 'w-[100px]']))
    expect(result.target).toBe('weapp')
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).toContain('background-color: var(--color-red-500)')
    expect(result.rawCss).toContain('.w-\\[100px\\]')
    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).toContain('width: 100px')
    expect(result.css).not.toContain('not-a-tailwind-class')
  })

  it('treats rpx arbitrary text values as lengths in generated mini-program css', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['text-[55rpx]', 'text-[32.4rpx]'],
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(result.classSet).toEqual(new Set(['text-[55rpx]', 'text-[32.4rpx]']))
    expect(result.css).toContain('.text-_b55rpx_B')
    expect(result.css).toContain('font-size: 55rpx')
    expect(result.css).toContain('.text-_b32_d4rpx_B')
    expect(result.css).toContain('font-size: 32.4rpx')
    expect(result.css).not.toContain('.text-_blength_c32_d4rpx_B')
    expect(result.css).not.toContain('text-\\[length\\:')
    expect(result.css).not.toContain('color: 55rpx')
    expect(result.css).not.toContain('color: 32.4rpx')

    const transformed = await transformTailwindV4CssToWeapp(
      '.text-\\[55rpx\\] { color: 55rpx; }',
      { isMainChunk: false },
    )

    expect(transformed).toContain('.text-_b55rpx_B')
    expect(transformed).toContain('font-size: 55rpx')
    expect(transformed).not.toContain('color: 55rpx')
  })

  it('treats rpx arbitrary text values as lengths in generated web css', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['text-[55rpx]', 'text-[32.4rpx]', 'hover:text-[66rpx]', 'hover:text-[32.4rpx]'],
      target: 'web',
    })

    expect(result.classSet).toEqual(new Set(['text-[55rpx]', 'text-[32.4rpx]', 'hover:text-[66rpx]', 'hover:text-[32.4rpx]']))
    expect(result.rawCandidates).toEqual(new Set(['text-[55rpx]', 'text-[32.4rpx]', 'hover:text-[66rpx]', 'hover:text-[32.4rpx]']))
    expect(result.css).toContain('.text-\\[55rpx\\]')
    expect(result.css).toContain('font-size: 55rpx')
    expect(result.css).toContain('.text-\\[32\\.4rpx\\]')
    expect(result.css).toContain('font-size: 32.4rpx')
    expect(result.css).toContain('.hover\\:text-\\[66rpx\\]')
    expect(result.css).toContain('font-size: 66rpx')
    expect(result.css).toContain('.hover\\:text-\\[32\\.4rpx\\]')
    expect(result.css).not.toContain('text-\\[length\\:')
    expect(result.css).not.toContain('color: 55rpx')
    expect(result.css).not.toContain('color: 32.4rpx')
    expect(result.css).not.toContain('color: 66rpx')
  })

  it('scopes Tailwind v4 gradient variables to mini-program component elements', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['bg-linear-to-r', 'from-amber-200', 'to-orange-200'],
      styleOptions: {
        isMainChunk: true,
      },
    })
    const css = compactCss(result.css)

    expect(css).toContain('view,text,:after,:before{--tw-gradient-position:initial')
    expect(css).toContain('page,.tw-root,wx-root-portal-content,:host{')
    expect(css).toContain('--tw-gradient-from:rgba(0,0,0,0)')
    expect(css).toContain('--tw-gradient-to:rgba(0,0,0,0)')
    expect(css).toContain('--tw-gradient-from-position:0%')
    expect(css).toContain('--tw-gradient-to-position:100%')
    expect(css).toContain('--color-amber-200:')
    expect(css).toContain('--color-orange-200:')
    expect(css).toContain('.from-amber-200{--tw-gradient-from:var(--color-amber-200)')
    expect(css).toContain('.to-orange-200{--tw-gradient-to:var(--color-orange-200)')
  })

  it('can append new utilities via the v4 incremental cache without full source scans', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const first = await engine.generate({
      candidates: ['text-[88rpx]'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })
    const second = await engine.generate({
      candidates: ['text-[88rpx]', 'text-[188rpx]', 'text-[32.4rpx]'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(first.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.classSet).toEqual(new Set(['text-[88rpx]', 'text-[188rpx]', 'text-[32.4rpx]']))
    expect(second.css).toContain('.text-_b88rpx_B')
    expect(second.css).toContain('font-size: 88rpx')
    expect(second.css).toContain('.text-_b188rpx_B')
    expect(second.css).toContain('font-size: 188rpx')
    expect(second.css).toContain('.text-_b32_d4rpx_B')
    expect(second.css).toContain('font-size: 32.4rpx')
    expect(second.css).not.toContain('.text-_blength_c32_d4rpx_B')
    expect(second.incrementalCss).toContain('.text-_b188rpx_B')
    expect(second.incrementalCss).toContain('font-size: 188rpx')
    expect(second.incrementalCss).toContain('.text-_b32_d4rpx_B')
    expect(second.incrementalCss).toContain('font-size: 32.4rpx')
    expect(second.incrementalCss).not.toContain('.text-_blength_c32_d4rpx_B')
    expect(second.incrementalCss).not.toContain('.text-_b88rpx_B')
    expect(second.css.match(/\.text-_b88rpx_B/g) ?? []).toHaveLength(1)
    expect(second.css.indexOf('.text-_b188rpx_B')).toBeGreaterThan(second.css.indexOf('.text-_b88rpx_B'))
  })

  it('regenerates the v4 incremental cache when requested utilities are removed', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const first = await engine.generate({
      candidates: ['text-[88rpx]', 'text-[188rpx]'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })
    const second = await engine.generate({
      candidates: ['text-[88rpx]'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(first.css).toContain('.text-_b88rpx_B')
    expect(first.css).toContain('.text-_b188rpx_B')
    expect(second.css).toContain('.text-_b88rpx_B')
    expect(second.css).not.toContain('.text-_b188rpx_B')
    expect(second.rawCss).not.toContain('.text-\\[188rpx\\]')
    expect(second.incrementalCss).toBeUndefined()
    expect(second.incrementalRawCss).toBeUndefined()
    expect(second.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.rawCandidates).toEqual(new Set(['text-[88rpx]']))
  })

  it('keeps rpx text selectors restored in web incremental css', async () => {
    const source = await resolveTailwindV4Source({
      css: `${MINIMAL_THEME_CSS}\n/* web rpx incremental */`,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const first = await engine.generate({
      candidates: ['text-[88rpx]'],
      incrementalCache: true,
      scanSources: false,
      target: 'web',
    })
    const second = await engine.generate({
      candidates: ['text-[88rpx]', 'text-[188rpx]', 'text-[32.4rpx]'],
      incrementalCache: true,
      scanSources: false,
      target: 'web',
    })

    expect(first.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.classSet).toEqual(new Set(['text-[88rpx]', 'text-[188rpx]', 'text-[32.4rpx]']))
    expect(second.css).toContain('.text-\\[88rpx\\]')
    expect(second.css).toContain('font-size: 88rpx')
    expect(second.css).toContain('.text-\\[188rpx\\]')
    expect(second.css).toContain('font-size: 188rpx')
    expect(second.css).toContain('.text-\\[32\\.4rpx\\]')
    expect(second.css).toContain('font-size: 32.4rpx')
    expect(second.incrementalCss).toContain('.text-\\[188rpx\\]')
    expect(second.incrementalCss).toContain('font-size: 188rpx')
    expect(second.incrementalCss).toContain('.text-\\[32\\.4rpx\\]')
    expect(second.incrementalCss).toContain('font-size: 32.4rpx')
    expect(second.css).not.toContain('text-\\[length\\:')
    expect(second.incrementalCss).not.toContain('text-\\[length\\:')
    expect(second.css).not.toContain('color: 88rpx')
    expect(second.css).not.toContain('color: 188rpx')
    expect(second.css).not.toContain('color: 32.4rpx')
  })

  it('remembers requested candidates that do not generate css in the v4 incremental cache', async () => {
    const source = await resolveTailwindV4Source({
      css: `${MINIMAL_THEME_CSS}\n/* invalid candidate cache regression */`,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const first = await engine.generate({
      candidates: ['text-[88rpx]', 'not-a-tailwind-class'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })
    const second = await engine.generate({
      candidates: ['text-[88rpx]', 'not-a-tailwind-class'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(first.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.rawCandidates).toEqual(new Set(['text-[88rpx]', 'not-a-tailwind-class']))
    expect(second.css.match(/\.text-_b88rpx_B/g) ?? []).toHaveLength(1)
  })

  it('seeds the v4 incremental cache from the initial source scan', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const first = await engine.generate({
      candidates: ['text-[88rpx]'],
      incrementalCache: true,
      scanSources: true,
      styleOptions: {
        isMainChunk: false,
      },
    })
    const second = await engine.generate({
      candidates: ['text-[88rpx]', 'text-[188rpx]'],
      incrementalCache: true,
      scanSources: false,
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(first.classSet).toEqual(new Set(['text-[88rpx]']))
    expect(second.classSet).toEqual(new Set(['text-[88rpx]', 'text-[188rpx]']))
    expect(second.css).toContain('.text-_b88rpx_B')
    expect(second.css).toContain('.text-_b188rpx_B')
    expect(second.css.match(/\.text-_b88rpx_B/g) ?? []).toHaveLength(1)
  })

  it('dedupes concurrent v4 incremental generation for identical requests', async () => {
    vi.resetModules()
    const generate = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return {
        css: '.text-\\[88rpx\\] { font-size: 88rpx; }',
        classSet: new Set(['text-[88rpx]']),
        rawCandidates: new Set(['text-[88rpx]']),
        dependencies: [],
        sources: [],
        root: null,
      }
    })
    vi.doMock('tailwindcss-patch', async (importOriginal) => {
      const actual = await importOriginal<typeof import('tailwindcss-patch')>()
      return {
        ...actual,
        createTailwindV4Engine: vi.fn(() => ({
          generate,
          loadDesignSystem: vi.fn(),
          source: {} as never,
          validateCandidates: vi.fn(),
        })),
      }
    })
    const { createTailwindV4Engine: createMockedTailwindV4Engine } = await import('@/tailwindcss/v4-engine')
    const source = {
      base: process.cwd(),
      baseFallbacks: [],
      css: MINIMAL_THEME_CSS,
      dependencies: [],
      projectRoot: process.cwd(),
      version: 4,
    } as const

    const [first, second] = await Promise.all([
      createMockedTailwindV4Engine(source).generate({
        candidates: ['text-[88rpx]'],
        incrementalCache: true,
        scanSources: false,
        styleOptions: {
          isMainChunk: false,
        },
      }),
      createMockedTailwindV4Engine(source).generate({
        candidates: ['text-[88rpx]'],
        incrementalCache: true,
        scanSources: false,
        styleOptions: {
          isMainChunk: false,
        },
      }),
    ])

    expect(generate).toHaveBeenCalledTimes(1)
    expect(first.css).toContain('.text-_b88rpx_B')
    expect(second.css).toContain('.text-_b88rpx_B')
  })

  it('uses mini-program-safe Tailwind v4 default color variables for native v4 weapp output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @import "tailwindcss4";
        @theme default {
          --color-blue-500: oklch(62.3% 0.214 259.815);
          --color-red-500: oklch(63.7% 0.237 25.331);
        }
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: false,
      candidates: ['bg-blue-500', 'text-red-500'],
    })

    expect(result.css).toContain('--color-blue-500: #2b7fff')
    expect(result.css).toContain('--color-red-500: #fb2c36')
    expect(result.css).toContain('--font-sans:')
    expect(result.css).toContain('--default-font-family: var(--font-sans)')
    expect(result.css).toContain('background-color: var(--color-blue-500)')
    expect(result.css).toContain('color: var(--color-red-500)')
    expect(result.css).not.toContain('oklch(')
    expect(result.css).not.toContain('oklab(')
  })

  it('keeps native Tailwind v4 OKLCH default color variables for web output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: oklch(62.3% 0.214 259.815);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['bg-blue-500'],
      target: 'web',
    })

    expect(result.css).toContain('--color-blue-500: oklch(62.3% 0.214 259.815)')
    expect(result.css).toContain('background-color: var(--color-blue-500)')
  })

  it('unwraps custom cascade layers for mini-program output while preserving native layers for web output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme {
          --color-midnight: #121063;
        }
        @layer components {
          .layer-card-v4 {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-midnight);
          }
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()
    const webResult = await engine.generate({
      target: 'web',
    })
    const css = compactCss(result.css)
    const webCss = compactCss(webResult.css)

    expect(result.rawCss).toContain('@layer components')
    expect(result.css).not.toContain('@layer')
    expect(css).toContain('.layer-card-v4{display:flex;align-items:center;gap:8px;color:var(--color-midnight);}')
    expect(webResult.css).toBe(webResult.rawCss)
    expect(webResult.css).toContain('@layer components')
    expect(webCss).toContain('@layercomponents{.layer-card-v4{display:flex;align-items:center;gap:8px;color:var(--color-midnight);}}')
  })

  it('removes unsupported vendor-prefixed keyframes from Tailwind v4 theme sources', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --animate-spin: spin 1s linear infinite;
          @-webkit-keyframes spin {
            to {
              -webkit-transform: rotate(1turn);
              transform: rotate(1turn);
            }
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['animate-spin'],
    })

    expect(result.classSet).toEqual(new Set(['animate-spin']))
    expect(result.rawCss).toContain('.animate-spin')
    expect(result.rawCss).toContain('@keyframes spin')
    expect(result.rawCss).not.toContain('@-webkit-keyframes')
  })

  it('extracts candidates from runtime sources', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      sources: [{
        extension: 'html',
        content: '<view class="w-4 bg-red-500 nope"></view>',
      }],
    })

    expect(result.classSet).toEqual(new Set(['bg-red-500', 'w-4']))
    expect(result.rawCss).toContain('.w-4')
    expect(result.rawCss).toContain('width: calc(var(--spacing) * 4)')
    expect(result.css).toContain('.w-4')
  })

  it('supports UnoCSS-style bare arbitrary values when explicitly enabled', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const disabledResult = await engine.generate({
      candidates: ['p-10%', 'p-2.5px', 'm-4rem'],
    })
    expect(disabledResult.classSet).toEqual(new Set())
    expect(disabledResult.rawCss).not.toContain('.p-10\\%')

    const enabledResult = await engine.generate({
      bareArbitraryValues: true,
      candidates: [
        'p-10%',
        'p-2.5px',
        'm-4rem',
        'bg-#fff',
        'text-rgb(255,0,0)',
        'w-calc(100vh)',
      ],
      sources: [{
        extension: 'html',
        content: '<view class="hover:!-mt-2rem sm:-top-1.5rem text-var(--brand)"></view>',
      }],
    })

    expect(enabledResult.classSet).toEqual(new Set([
      'bg-#fff',
      'hover:!-mt-2rem',
      'm-4rem',
      'p-10%',
      'p-2.5px',
      'text-rgb(255,0,0)',
      'w-calc(100vh)',
    ]))
    expect(enabledResult.rawCss).toContain('.p-10\\%')
    expect(enabledResult.css).toContain('.p-10_v')
    expect(enabledResult.css).toContain('.p-2_d5px')
    expect(enabledResult.css).toContain('.m-4rem')
    expect(enabledResult.css).toContain('.bg-_hfff')
    expect(enabledResult.css).toContain('.text-rgb_p255_m0_m0_P')
    expect(enabledResult.css).toContain('.w-calc_p100vh_P')

    const bareColorResult = await engine.generate({
      bareArbitraryValues: true,
      candidates: ['bg-#000'],
    })

    expect(bareColorResult.classSet).toEqual(new Set(['bg-#000']))
    expect(bareColorResult.rawCss).toContain('.bg-\\#000')
    expect(bareColorResult.rawCss).toContain('background-color: #000')
    expect(bareColorResult.css).toContain('.bg-_h000')
    expect(bareColorResult.css).toContain('background-color: #000')

    const limitedResult = await engine.generate({
      bareArbitraryValues: {
        units: ['px'],
      },
      candidates: ['p-10%', 'p-10px'],
    })

    expect(limitedResult.classSet).toEqual(new Set(['p-10px']))
    expect(limitedResult.css).toContain('.p-10px')
    expect(limitedResult.css).not.toContain('.p-10_v')
  })

  it('includes @source inline candidates in the class set', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --spacing: 0.25rem;
        }
        @source inline("w-4");
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect(result.classSet).toEqual(new Set(['w-4']))
    expect(result.rawCss).toContain('.w-4')
    expect(result.rawCss).toContain('width: calc(var(--spacing) * 4)')
    expect(result.css).toContain('.w-4')
  })

  it('scans compiled @source entries by default', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-engine-'))
    const srcDir = path.join(root, 'src')
    await writeFile(path.join(root, 'ignored.html'), '<view class="bg-blue-500"></view>', 'utf8')
    await mkdir(srcDir, { recursive: true })
    await writeFile(path.join(srcDir, 'index.html'), '<view class="bg-red-500"></view>', 'utf8')
    const source = await resolveTailwindV4Source({
      projectRoot: root,
      base: root,
      css: `
        @theme default {
          --color-red-500: oklch(63.7% 0.237 25.331);
          --color-blue-500: oklch(62.3% 0.214 259.815);
        }
        @source "./src/**/*.html";
        @tailwind utilities;
      `,
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect(result.classSet).toEqual(new Set(['bg-red-500']))
    expect(result.sources).toEqual([
      {
        base: root,
        pattern: './src/**/*.html',
        negated: false,
      },
    ])
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).not.toContain('.bg-blue-500')
    expect(result.css).toContain('.bg-red-500')
    expect(result.css).not.toContain('.bg-blue-500')
  })

  it('supports official source detection directives in generator mode', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-source-detection-'))
    const srcDir = path.join(root, 'src')
    await linkTailwindcssPackage(root)
    await mkdir(srcDir, { recursive: true })
    await writeFile(path.join(srcDir, 'page.html'), '<view class="bg-red-500 w-4"></view>', 'utf8')
    await writeFile(path.join(srcDir, 'ignored.html'), '<view class="bg-blue-500"></view>', 'utf8')
    await writeFile(path.join(root, 'outside.html'), '<view class="text-blue-500"></view>', 'utf8')
    const cssEntry = path.join(root, 'app.css')
    await writeFile(cssEntry, `
      @theme default {
        --color-red-100: #fee2e2;
        --color-red-200: #fecaca;
        --color-red-300: #fca5a5;
        --color-red-500: oklch(63.7% 0.237 25.331);
        --color-blue-500: oklch(62.3% 0.214 259.815);
        --spacing: 0.25rem;
      }
      @import "tailwindcss" source(none);
      @source "./src/**/*.html";
      @source not "./src/ignored.html";
      @source inline("underline {hover:,focus:}underline bg-red-{100..300..100}");
      @source not inline("focus:underline");
      @tailwind utilities;
    `, 'utf8')
    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: [cssEntry],
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect([...result.classSet]).toEqual(expect.arrayContaining([
      'bg-red-100',
      'bg-red-200',
      'bg-red-300',
      'bg-red-500',
      'hover:underline',
      'underline',
      'w-4',
    ]))
    expect(result.classSet.has('bg-blue-500')).toBe(false)
    expect(result.classSet.has('focus:underline')).toBe(false)
    expect(result.classSet.has('text-blue-500')).toBe(false)
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).toContain('.hover\\:underline')
    expect(result.rawCss).not.toContain('.focus\\:underline')
    expect(result.css).toContain('.bg-red-500')
    expect(result.css).not.toContain('@source')
  })

  it('keeps Tailwind v4 default ignored paths for negated-only source directives', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-source-negated-only-'))
    const srcDir = path.join(root, 'src')
    await linkTailwindcssPackage(root)
    await mkdir(srcDir, { recursive: true })
    await mkdir(path.join(root, 'node_modules', 'ignored-pkg'), { recursive: true })
    await writeFile(path.join(srcDir, 'page.html'), '<view class="bg-red-500"></view>', 'utf8')
    await writeFile(path.join(root, 'node_modules', 'ignored-pkg', 'index.js'), 'export const cls = "bg-blue-500"', 'utf8')
    await writeFile(path.join(root, 'pnpm-lock.yaml'), 'lockfileVersion: "9.0"\npackages:\n  bg-green-500: {}\n', 'utf8')
    const cssEntry = path.join(root, 'app.css')
    await writeFile(cssEntry, `
      @theme default {
        --color-red-500: oklch(63.7% 0.237 25.331);
        --color-blue-500: oklch(62.3% 0.214 259.815);
        --color-green-500: oklch(72.3% 0.219 149.579);
      }
      @import "tailwindcss";
      @source not "./dist";
      @tailwind utilities;
    `, 'utf8')
    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: [cssEntry],
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect(result.classSet).toEqual(new Set(['bg-red-500']))
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).not.toContain('.bg-blue-500')
    expect(result.rawCss).not.toContain('.bg-green-500')
  })

  it('uses the Tailwind v4 import source base for automatic source detection', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-source-base-'))
    const srcDir = path.join(root, 'src')
    await linkTailwindcssPackage(root)
    await mkdir(srcDir, { recursive: true })
    await writeFile(path.join(srcDir, 'page.html'), '<view class="bg-red-500"></view>', 'utf8')
    await writeFile(path.join(root, 'outside.html'), '<view class="bg-blue-500"></view>', 'utf8')
    const cssEntry = path.join(root, 'app.css')
    await writeFile(cssEntry, `
      @theme default {
        --color-red-500: oklch(63.7% 0.237 25.331);
        --color-blue-500: oklch(62.3% 0.214 259.815);
      }
      @import "tailwindcss" source("./src");
      @tailwind utilities;
    `, 'utf8')
    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: [cssEntry],
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect(result.classSet).toEqual(new Set(['bg-red-500']))
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).not.toContain('.bg-blue-500')
  })

  it('resolves cssEntries and tracks the entry dependency', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-engine-'))
    const cssEntry = path.join(root, 'app.css')
    await writeFile(cssEntry, MINIMAL_THEME_CSS, 'utf8')

    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: ['app.css'],
    })
    const engine = createTailwindV4Engine(source)
    const result = await engine.generate({ candidates: ['w-4'] })

    expect(source.base).toBe(root)
    expect(result.dependencies).toContain(cssEntry)
    expect(result.classSet).toEqual(new Set(['w-4']))
    expect(result.css).toContain('.w-4')
  })

  it('supports Tailwind v4 subpath imports for @import, @reference, @plugin, and @config', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-subpath-'))
    const cssDir = path.join(root, 'src', 'css')
    const srcDir = path.join(root, 'src')
    const cssEntry = path.join(cssDir, 'entry.css')
    await mkdir(cssDir, { recursive: true })
    await writeFile(path.join(root, 'package.json'), JSON.stringify({
      imports: {
        '#tokens.css': './src/css/tokens.css',
        '#reference.css': './src/css/reference.css',
        '#legacy-plugin': './tailwind.plugin.cjs',
        '#tw-config': './tailwind.config.cjs',
      },
    }, null, 2), 'utf8')
    await writeFile(path.join(root, 'tailwind.config.cjs'), [
      'module.exports = {',
      '  theme: {',
      '    extend: {',
      '      colors: { config: "#445566" },',
      '      spacing: { config: "11px" },',
      '    },',
      '  },',
      '}',
    ].join('\n'), 'utf8')
    await writeFile(path.join(root, 'tailwind.plugin.cjs'), [
      'module.exports = function ({ addUtilities }) {',
      '  addUtilities({',
      '    ".plugin-card": { color: "#778899" },',
      '  })',
      '}',
    ].join('\n'), 'utf8')
    await writeFile(path.join(cssDir, 'tokens.css'), [
      '@theme {',
      '  --color-imported: #123456;',
      '  --color-reference: #246810;',
      '}',
    ].join('\n'), 'utf8')
    await writeFile(path.join(cssDir, 'reference.css'), [
      '@import "#tokens.css";',
      '@utility ref-bg {',
      '  background-color: var(--color-reference);',
      '}',
    ].join('\n'), 'utf8')
    await writeFile(path.join(srcDir, 'page.html'), [
      '<div class="bg-imported bg-config plugin-card card-shell ref-card m-config"></div>',
    ].join('\n'), 'utf8')
    await writeFile(cssEntry, [
      '@config "#tw-config";',
      '@plugin "#legacy-plugin";',
      '@reference "#reference.css";',
      '@import "#tokens.css";',
      '@source "../page.html";',
      '@tailwind utilities;',
      '.card-shell {',
      '  @apply bg-imported;',
      '}',
      '.ref-card {',
      '  @apply ref-bg;',
      '}',
      '',
    ].join('\n'), 'utf8')

    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: [cssEntry],
    })
    const engine = createTailwindV4Engine(source)
    const result = await engine.generate()

    expect([...result.classSet]).toEqual(expect.arrayContaining([
      'bg-config',
      'bg-imported',
      'm-config',
      'plugin-card',
    ]))
    expect(result.rawCss).toContain('background-color: var(--color-imported)')
    expect(result.rawCss).toContain('background-color: var(--color-reference)')
    expect(result.rawCss).toContain('background-color: #445566')
    expect(result.rawCss).toContain('margin: 11px')
    expect(result.rawCss).toContain('color: #778899')
    expect(result.rawCss).toContain('.card-shell')
    expect(result.rawCss).toContain('.ref-card')
    expect(result.rawCss).not.toContain('@config')
    expect(result.rawCss).not.toContain('@plugin')
    expect(result.rawCss).not.toContain('@reference')
  })

  it('keeps cssEntries source options aligned with tailwindcss-patch defaults', async () => {
    const implicitPatchOptions = {
      projectRoot: '/workspace/app',
      tailwindcss: {
        cwd: '/workspace/app',
        packageName: 'tailwindcss',
        v4: {
          cssEntries: ['/workspace/app/src/app.css'],
        },
      },
    } satisfies TailwindCssPatchOptions
    const explicitPatchOptions = {
      projectRoot: '/workspace/app',
      tailwindcss: {
        cwd: '/workspace/app',
        packageName: 'tailwindcss',
        v4: {
          base: '/custom/base',
          cssEntries: ['/workspace/app/src/app.css'],
        },
      },
    } satisfies TailwindCssPatchOptions
    const implicitBaseOptions = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            base: '/workspace/app',
            hasUserDefinedSources: false,
            cssEntries: ['/workspace/app/src/app.css'],
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)
    const explicitBaseOptions = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            base: '/workspace/app',
            configuredBase: '/custom/base',
            hasUserDefinedSources: false,
            cssEntries: ['/workspace/app/src/app.css'],
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)
    const rawExplicitBaseOptions = resolveTailwindV4SourceOptionsFromPatcher({
      options: explicitPatchOptions,
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)
    const implicitPatchSource = await resolveTailwindV4SourceFromPatchOptions(implicitPatchOptions)
    const explicitPatchSource = await resolveTailwindV4SourceFromPatchOptions(explicitPatchOptions)

    expect(implicitBaseOptions.base).toBeUndefined()
    expect(explicitBaseOptions.base).toBe('/custom/base')
    expect(rawExplicitBaseOptions.base).toBe('/custom/base')
    expect(implicitBaseOptions.cssEntries).toEqual(['/workspace/app/src/app.css'])
    expect(explicitBaseOptions.cssEntries).toEqual(['/workspace/app/src/app.css'])
    expect(implicitBaseOptions.baseFallbacks).toEqual([
      '/workspace/app',
    ])
    expect(explicitBaseOptions.baseFallbacks).toEqual([
      '/custom/base',
      '/workspace/app',
    ])
    expect(implicitPatchSource.base).toBe('/workspace/app/src')
    expect(explicitPatchSource.base).toBe('/custom/base')
  })

  it('passes configured v4 source entries through for bundler generation', () => {
    const sourceEntries = [
      {
        base: '/workspace/app',
        pattern: 'src/**/*.{vue,tsx,wxml}',
        negated: false,
      },
      {
        base: '/workspace/app',
        pattern: 'dist',
        negated: true,
      },
    ]
    const options = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            cssEntries: ['/workspace/app/src/app.css'],
            sources: sourceEntries,
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)

    expect(options.sources).toBe(sourceEntries)
  })

  it('keeps missing cssEntries as imports for Tailwind resolution', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-engine-'))
    const cssEntry = path.join(root, 'missing.css')

    const source = await resolveTailwindV4Source({
      projectRoot: root,
      cssEntries: ['missing.css'],
    })

    expect(source.dependencies).toEqual([cssEntry])
    expect(source.css).toBe('@import "missing.css";')
  })

  it('uses mini-program css as the default output', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['hover:bg-blue-500', 'w-[100px]'],
    })

    expect(result.target).toBe('weapp')
    expect(result.rawCss).toContain('.hover\\:bg-blue-500')
    expect(result.rawCss).toContain('@media (hover: hover)')
    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).toContain('width: 100px')
    expect(result.css).not.toContain(':hover')
    expect(result.css).not.toContain('@supports')
  })

  it('downgrades Tailwind v4 color-mix alpha colors for mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-white: #fff;
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['text-white/10'],
    })

    expect(result.rawCss).toContain('color-mix')
    expect(result.css).toContain('.text-white_f10')
    expect(result.css).toContain('color: rgba(255, 255, 255, 0.1)')
    expect(result.css).not.toContain('color-mix')
    expect(result.css).not.toContain('oklab')
    expect(result.css).not.toContain('oklch')
    expect(result.css).not.toContain('display-p3')
  })

  it('keeps modern color syntax out of incremental mini-program css', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-white: #fff;
          --color-blue-500: oklch(62.3% 0.214 259.815);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
      scanSources: false,
    })
    const result = await engine.generate({
      candidates: ['bg-blue-500', 'text-white/10'],
      incrementalCache: true,
      scanSources: false,
    })

    expect(result.css).toContain('background-color: var(--color-blue-500)')
    expect(result.css).toContain('color: rgba(255, 255, 255, 0.1)')
    expect(result.incrementalCss).toContain('.text-white_f10')
    expect(result.incrementalCss).not.toContain('view,text,:after,:before')
    expect(result.css).not.toContain('color-mix')
    expect(result.css).not.toContain('oklab')
    expect(result.css).not.toContain('oklch')
    expect(result.css).not.toContain('display-p3')
  })

  it('keeps Tailwind v3 default values in v4 generator output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --blur-sm: 8px;
          --radius-sm: 0.25rem;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: true,
      target: 'web',
      candidates: ['ring', 'border', 'shadow-sm', 'rounded-sm', 'blur-sm', 'outline'],
    })

    expect(result.css).toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).not.toContain('@layer base')
    expect(result.css).toContain('--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
    expect(result.css).toContain('border-radius: var(--radius-sm)')
    expect(result.css).toContain('--tw-blur: blur(var(--blur-sm))')
    expect(result.css).toContain('--blur-sm: 4px')
    expect(result.css).toContain('outline-width: 3px')
  })

  it('uses Tailwind v3 compatibility default values for mini-program output by default', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['ring', 'border', 'shadow-sm'],
    })

    expect(result.css).toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.05))')
  })

  it('can opt out of Tailwind v3 compatibility default values for native Tailwind v4 output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --blur-sm: 8px;
          --radius-sm: 0.25rem;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: false,
      target: 'web',
      candidates: ['ring', 'border', 'shadow-sm', 'rounded-sm', 'blur-sm', 'outline'],
    })

    expect(result.css).not.toContain('--default-ring-width: 3px')
    expect(result.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))')
    expect(result.css).not.toContain('--blur-sm: 4px')
    expect(result.css).toContain('outline-width: 1px')
  })

  it('expands spacing child combinators for view and text in mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --spacing: 0.25rem;
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['space-y-4'],
    })
    const css = compactCss(result.css)

    expect(css).toContain('.space-y-4>view+view')
    expect(css).toContain('.space-y-4>view+text')
    expect(css).toContain('.space-y-4>text+view')
    expect(css).toContain('.space-y-4>text+text')
  })

  it('removes browser preflight while keeping utility variables for mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --spacing: 0.25rem;
        }
        @tailwind base;
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['transform', 'before:bg-gray-200', 'before:content-["x"]', 'w-4'],
    })

    expect(result.rawCss).toContain('::before')
    expect(result.css).toContain('.transform')
    expect(result.css).toContain('.w-4')
    expect(result.css).toContain('--tw-rotate-x')
    expect(result.css).toContain('--tw-content: "x"')
    expect(result.css).toContain('--tw-content: ""')
    expect(result.css).toContain('background-color: var(--color-gray-200)')
    expect(result.css).not.toContain('::-webkit')
    expect(result.css).not.toContain(':-moz')
    expect(result.css).not.toMatch(/^::before,\s*::after\s*\{\s*--tw-content:/m)
    expect(result.css).not.toContain('@supports')
  })

  it('quotes generated complex url values before mini-program postcss handling', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: false,
      candidates: ['[background:url(https://example.com?q={[{[([{[[2]]}])]}]})]'],
    })

    expect(result.rawCss).toContain('background: url(https://example.com')
    expect(result.css).toContain('background: url("https://example.com')
  })

  it('filters unsupported slash variants from mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: false,
      candidates: ['in-[.group/name]:flex', 'not-in-[.group/name]:flex', 'group-hover/item:visible', 'flex'],
    })

    expect(result.rawCss).not.toContain('in-')
    expect(result.rawCss).not.toContain('not-in-')
    expect(result.rawCss).not.toContain('group-hover')
    expect(result.css).toContain('.flex')
    expect(result.css).not.toContain('in-')
    expect(result.css).not.toContain('not-in-')
    expect(result.css).not.toContain('group-hover')
  })

  it('can return raw Tailwind css for diagnostics', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      target: 'tailwind',
      candidates: ['w-[100px]'],
    })

    expect(result.target).toBe('tailwind')
    expect(result.css).toBe(result.rawCss)
    expect(result.css).toContain('.w-\\[100px\\]')
    expect(result.css).not.toContain('.w-_b100px_B')
  })

  it('can generate web css without mini-program selector transforms', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      target: 'web',
      candidates: ['hover:bg-blue-500', 'w-[100px]'],
    })

    expect(result.target).toBe('web')
    expect(result.css).toBe(result.rawCss)
    expect(result.css).toContain('.hover\\:bg-blue-500')
    expect(result.css).toContain('@media (hover: hover)')
    expect(result.css).toContain('.w-\\[100px\\]')
    expect(result.css).not.toContain('.w-_b100px_B')
  })
})
