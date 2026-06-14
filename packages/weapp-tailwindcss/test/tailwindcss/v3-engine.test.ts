import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { clearTailwindV3IncrementalGenerateCacheForTest, createTailwindV3Engine, getTailwindV3IncrementalGenerateCacheStatsForTest, resolveTailwindV3Source, transformTailwindV3CssToWeapp } from '@/tailwindcss/v3-engine'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import plugin from 'tailwindcss/plugin'

const UNOCSS_DEFAULT_STYLE_CANDIDATES = [
  'w-10px',
  'w-1/2',
  'w-50%',
  'w-2.5rem',
  'h-100vh',
  'min-w-20em',
  'max-w-80vw',
  'size-10px',
  'basis-20%',
  'grid-cols-200px',
  'aspect-16/9',
  'p-10px',
  'px-1.5rem',
  'py-2em',
  'm-4rem',
  '-mt-2px',
  'gap-12px',
  'top-1/2',
  '-top-1.5rem',
  'translate-x-10px',
  'rotate-45deg',
  'rounded-2px',
  'border-1px',
  'outline-2px',
  'blur-4px',
  'leading-1.2em',
  'tracking-0.1em',
  'duration-300ms',
  'delay-1s',
  'opacity-50%',
  'bg-#fff',
  'bg-#ffffff80',
  'text-#f00',
  'text-rgb(255,0,0)',
  'w-calc(100%-1rem)',
]

const UNOCSS_DEFAULT_SOURCE_CLASSES = [
  'hover:!p-2.5px',
  'sm:-top-1.5rem',
  'text-var(--brand)',
]

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

describe('tailwindcss v3 engine', () => {
  afterEach(() => {
    clearTailwindV3IncrementalGenerateCacheForTest()
  })

  it('prefers inline configObject over loaded Tailwind config files', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v3-source-config-'))
    const configFile = path.join(root, 'tailwind.config.cjs')
    await writeFile(configFile, [
      'module.exports = {',
      '  content: [{ raw: "text-red-500", extension: "html" }],',
      '}',
      '',
    ].join('\n'))
    const inlineConfig = {
      content: [{
        raw: 'text-green-500',
        extension: 'html',
      }],
    }

    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: root,
      cwd: root,
      config: configFile,
      configObject: inlineConfig,
    })

    expect(source.config).toBe(configFile)
    expect(source.configObject).toBe(inlineConfig)
    expect(source.configObject?.content).toEqual(inlineConfig.content)
  })

  it('reuses runtime patch setup for repeated engines with the same source', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: path.resolve(process.cwd(), 'demo/uni-app-vite-tailwindcss-v3'),
      config: undefined,
    })
    const patchSpy = vi.spyOn(TailwindcssPatcher.prototype, 'patch')

    const first = createTailwindV3Engine(source)
    const second = createTailwindV3Engine(source)

    try {
      await first.generate({ candidates: ['bg-blue-500'] })
      await second.generate({ candidates: ['bg-[#123455]'] })

      expect(patchSpy).toHaveBeenCalledTimes(1)
    }
    finally {
      patchSpy.mockRestore()
    }
  })

  it('generates without loading the Tailwind v3 PostCSS plugin entry', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
      postcssPlugin: 'tailwindcss/__missing_postcss_plugin__',
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['w-4'],
    })

    expect(result.css).toContain('.w-4')
    expect(result.classSet).toEqual(new Set(['w-4']))
  })

  it('removes browser preflight while keeping utility variables for mini-program output', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind base; @tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['transform', 'before:content-["x"]', 'w-4'],
    })

    expect(result.rawCss).toContain('button')
    expect(result.rawCss).toContain('::before')
    expect(result.css).toContain('.transform')
    expect(result.css).toContain('.w-4')
    expect(result.css).toContain('--tw-translate-x')
    expect(result.css).toContain('--tw-content')
    expect(compactCss(result.css)).toContain('::before,::after{--tw-content:"";}')
    expect(result.css).toContain('view,text,::before,::after')
    expect(result.css).toContain('box-sizing: border-box')
    expect(result.css).toContain('border-width: 0')
    expect(result.css).toContain('border-style: solid')
    expect(result.css).toContain('border-color:')
    expect(result.css).not.toContain(':host,page,.tw-root,wx-root-portal-content')
    expect(result.css).not.toContain('input:where')
    expect(result.css).not.toContain('::-webkit')
    expect(result.css).toContain('view,text,::after,::before')
  })

  it('treats rpx arbitrary text values as lengths in generated mini-program css', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['text-[55rpx]'],
      styleOptions: {
        isMainChunk: false,
      },
    })

    expect(result.classSet).toEqual(new Set(['text-[55rpx]']))
    expect(result.css).toContain('.text-_b55rpx_B')
    expect(result.css).toContain('font-size: 55rpx')
    expect(result.css).not.toContain('color: 55rpx')

    const transformed = await transformTailwindV3CssToWeapp(
      '.text-\\[55rpx\\] { color: 55rpx; }',
      { isMainChunk: false },
    )

    expect(transformed).toContain('.text-_b55rpx_B')
    expect(transformed).toContain('font-size: 55rpx')
    expect(transformed).not.toContain('color: 55rpx')
  })

  it('supports default UnoCSS class syntax when bare arbitrary values are enabled', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const disabledResult = await engine.generate({
      candidates: ['p-10%', 'p-2.5px', 'm-4rem'],
    })
    expect(disabledResult.classSet).toEqual(new Set())
    expect(disabledResult.rawCss).not.toContain('.p-10\\%')

    const enabledResult = await engine.generate({
      bareArbitraryValues: true,
      candidates: UNOCSS_DEFAULT_STYLE_CANDIDATES,
      sources: [{
        extension: 'html',
        content: `<view class="${UNOCSS_DEFAULT_SOURCE_CLASSES.join(' ')}"></view>`,
      }],
    })

    expect(enabledResult.classSet).toEqual(new Set([
      ...UNOCSS_DEFAULT_STYLE_CANDIDATES,
      ...UNOCSS_DEFAULT_SOURCE_CLASSES,
    ]))
    expect(enabledResult.rawCandidates).toEqual(new Set([
      ...UNOCSS_DEFAULT_STYLE_CANDIDATES,
      ...UNOCSS_DEFAULT_SOURCE_CLASSES,
    ]))
    expect(enabledResult.rawCss).toContain('.w-10px')
    expect(enabledResult.rawCss).toContain('.w-1\\/2')
    expect(enabledResult.rawCss).toContain('.w-50\\%')
    expect(enabledResult.rawCss).toContain('.bg-\\#fff')
    expect(enabledResult.rawCss).toContain('.text-rgb\\(255\\,0\\,0\\)')
    expect(enabledResult.rawCss).toContain('.hover\\:\\!p-2\\.5px:hover')
    expect(enabledResult.rawCss).toContain('.sm\\:-top-1\\.5rem')
    expect(enabledResult.rawCss).not.toContain('.w-\\[10px\\]')
    expect(enabledResult.rawCss).not.toContain('.bg-\\[\\#fff\\]')
    expect(enabledResult.css).toContain('.w-10px')
    expect(enabledResult.css).toContain('.w-1_f2')
    expect(enabledResult.css).toContain('.w-50_v')
    expect(enabledResult.css).toContain('.w-2_d5rem')
    expect(enabledResult.css).toContain('.h-100vh')
    expect(enabledResult.css).toContain('.min-w-20em')
    expect(enabledResult.css).toContain('.max-w-80vw')
    expect(enabledResult.css).toContain('.size-10px')
    expect(enabledResult.css).toContain('.basis-20_v')
    expect(enabledResult.css).toContain('.grid-cols-200px')
    expect(enabledResult.css).toContain('.aspect-16_f9')
    expect(enabledResult.css).toContain('.p-10px')
    expect(enabledResult.css).toContain('.px-1_d5rem')
    expect(enabledResult.css).toContain('.py-2em')
    expect(enabledResult.css).toContain('.m-4rem')
    expect(enabledResult.css).toContain('.-mt-2px')
    expect(enabledResult.css).toContain('.gap-12px')
    expect(enabledResult.css).toContain('.top-1_f2')
    expect(enabledResult.css).toContain('.-top-1_d5rem')
    expect(enabledResult.css).toContain('.translate-x-10px')
    expect(enabledResult.css).toContain('.rotate-45deg')
    expect(enabledResult.css).toContain('.rounded-2px')
    expect(enabledResult.css).toContain('.border-1px')
    expect(enabledResult.css).toContain('.outline-2px')
    expect(enabledResult.css).toContain('.blur-4px')
    expect(enabledResult.css).toContain('.leading-1_d2em')
    expect(enabledResult.css).toContain('.tracking-0_d1em')
    expect(enabledResult.css).toContain('.duration-300ms')
    expect(enabledResult.css).toContain('.delay-1s')
    expect(enabledResult.css).toContain('.opacity-50_v')
    expect(enabledResult.css).toContain('.bg-_hfff')
    expect(enabledResult.css).toContain('.bg-_hffffff80')
    expect(enabledResult.css).toContain('.text-_hf00')
    expect(enabledResult.css).toContain('.text-rgb_p255_m0_m0_P')
    expect(enabledResult.css).toContain('.text-var_p--brand_P')
    expect(enabledResult.css).toContain('.w-calc_p100_v-1rem_P')
    expect(enabledResult.css).toContain('.sm_c-top-1_d5rem')
    expect(enabledResult.css).toContain('@media (min-width: 640px)')
    expect(enabledResult.css).toContain('background-color: rgba(255, 255, 255')
    expect(enabledResult.css).toContain('color: var(--brand)')
    expect(enabledResult.css).toContain('width: calc(100% - 1rem)')
    expect(enabledResult.css).not.toContain(':hover')

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

  it('keeps UnoCSS-style bare arbitrary values stable in v3 incremental generation', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      bareArbitraryValues: true,
      candidates: ['w-10px'],
      incrementalCache: true,
    })
    const second = await engine.generate({
      bareArbitraryValues: true,
      candidates: ['w-10px', 'bg-#fff', 'text-var(--brand)'],
      incrementalCache: true,
    })

    expect(first.classSet).toEqual(new Set(['w-10px']))
    expect(first.css).toContain('.w-10px')
    expect(second.classSet).toEqual(new Set(['w-10px', 'bg-#fff', 'text-var(--brand)']))
    expect(second.incrementalCss).toContain('.bg-_hfff')
    expect(second.incrementalCss).toContain('.text-var_p--brand_P')
    expect(second.incrementalCss).not.toContain('.w-10px')
    expect(second.rawCss).not.toContain('.bg-\\[\\#fff\\]')
    expect(second.rawCandidates).toEqual(new Set(['w-10px', 'bg-#fff', 'text-var(--brand)']))
  })

  it('bounds v3 incremental generation cache across changing sources', async () => {
    clearTailwindV3IncrementalGenerateCacheForTest()
    const initialStats = getTailwindV3IncrementalGenerateCacheStatsForTest()

    for (let index = 0; index < initialStats.max + 4; index += 1) {
      const source = await resolveTailwindV3Source({
        css: `@tailwind utilities;\n/* cache-source-${index} */`,
        base: process.cwd(),
        config: undefined,
      })
      const engine = createTailwindV3Engine(source)
      await engine.generate({
        candidates: [`text-[${index}px]`],
        incrementalCache: true,
      })
    }

    const stats = getTailwindV3IncrementalGenerateCacheStatsForTest()
    expect(stats.size).toBeLessThanOrEqual(stats.max)
  })

  it('bounds v3 incremental cache entries across long HMR-style candidate growth', async () => {
    clearTailwindV3IncrementalGenerateCacheForTest()
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)
    const stats = getTailwindV3IncrementalGenerateCacheStatsForTest()
    const stableCandidates = ['bg-blue-500']

    for (let index = 0; index < stats.entryCandidatesMax + 12; index += 1) {
      await engine.generate({
        candidates: [...stableCandidates, `text-[${index}px]`],
        incrementalCache: true,
      })
    }

    const nextStats = getTailwindV3IncrementalGenerateCacheStatsForTest()
    expect(nextStats.entries).toHaveLength(1)
    expect(nextStats.entries[0]?.candidates).toBe(stableCandidates.length + 1)
    expect(nextStats.entries[0]?.candidates).toBeLessThanOrEqual(stats.entryCandidatesMax)
    expect(nextStats.entries[0]?.cssBytes).toBeLessThanOrEqual(stats.entryCssBytesMax)
  })

  it('expands divide child combinators for view and text in mini-program output', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['divide-x-8', 'divide-solid', 'divide-[#60d256]'],
    })
    const css = compactCss(result.css)

    expect(css).toContain('.divide-x-8>view+view')
    expect(css).toContain('.divide-x-8>view+text')
    expect(css).toContain('.divide-x-8>text+view')
    expect(css).toContain('.divide-x-8>text+text')
    expect(css).toContain('.divide-solid>text+text')
    expect(css).toContain('.divide-_b_h60d256_B>text+view')
  })

  it('injects legacy mini-program preflight reset when Tailwind v3 preflight is disabled', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind base; @tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    source.configObject = {
      content: [],
      corePlugins: {
        preflight: false,
      },
    }
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['block'],
      styleOptions: {
        cssPreflight: {
          'box-sizing': 'border-box',
          'border-width': '0',
          'border-style': 'solid',
          'border-color': 'currentColor',
        },
      },
    })

    const css = compactCss(result.css)
    expect(css).toContain('::before,::after{--tw-content:""}')
    expect(css).toContain('view,text,::after,::before{--tw-border-spacing-x:0')
    expect(css).toContain('box-sizing:border-box')
    expect(css).toContain('border-width:0')
    expect(css).toContain('border-style:solid')
    expect(css).toContain('border-color:currentColor')
    expect(result.css).not.toContain(':host,page,.tw-root,wx-root-portal-content')
  })

  it('removes browser-only supports rules from mini-program output', async () => {
    const source = await resolveTailwindV3Source({
      css: [
        '@tailwind utilities;',
        '@layer utilities {',
        '  @supports (color: color(display-p3 0 0 0%)) {',
        '    .supports-p3 { color: color(display-p3 1 0 0); }',
        '  }',
        '}',
      ].join('\n'),
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['supports-p3'],
    })

    expect(result.rawCss).toContain('@supports')
    expect(result.css).not.toContain('@supports')
    expect(result.css).not.toContain('.supports-p3')
  })

  it('deduplicates transition-property declarations in mini-program output', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['transition'],
    })
    const transitionRule = result.css.match(/\.transition\s*\{[\s\S]*?\}/)?.[0] ?? ''

    expect(transitionRule.match(/transition-property:/g) ?? []).toHaveLength(1)
    expect(transitionRule).toContain('transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter')
  })

  it('keeps web output as Tailwind v3 browser css', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind base; @tailwind utilities;',
      base: process.cwd(),
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      target: 'web',
      candidates: ['w-4'],
    })

    expect(result.css).toBe(result.rawCss)
    expect(result.css).toContain('button')
    expect(result.css).toContain('.w-4')
  })

  it('does not leak class cache between repeated generations', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      candidates: ['bg-blue-500'],
    })
    const second = await engine.generate({
      candidates: ['bg-[#123455]'],
    })

    expect(first.css).toContain('.bg-blue-500')
    expect(first.classSet).toEqual(new Set(['bg-blue-500']))
    expect(second.css).toContain('.bg-_b_h123455_B')
    expect(second.css).not.toContain('.bg-blue-500')
    expect(second.classSet).toEqual(new Set(['bg-[#123455]']))
  })

  it('can append new utilities via the v3 incremental cache without duplicating preflight', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind base; @tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })
    const second = await engine.generate({
      candidates: ['bg-blue-500', 'bg-[#123455]'],
      incrementalCache: true,
    })

    expect(first.css).toContain('.bg-blue-500')
    expect(second.css).toContain('.bg-blue-500')
    expect(second.css).toContain('.bg-_b_h123455_B')
    expect(second.incrementalCss).toContain('.bg-_b_h123455_B')
    expect(second.incrementalCss).not.toContain('.bg-blue-500')
    expect(second.classSet).toEqual(new Set(['bg-blue-500', 'bg-[#123455]']))
    expect(second.css.match(/\.bg-blue-500/g) ?? []).toHaveLength(1)
  })

  it('regenerates the v3 incremental cache when requested utilities are removed', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind base; @tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      candidates: ['bg-blue-500', 'bg-[#123455]'],
      incrementalCache: true,
    })
    const second = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })

    expect(first.css).toContain('.bg-blue-500')
    expect(first.css).toContain('.bg-_b_h123455_B')
    expect(second.css).toContain('.bg-blue-500')
    expect(second.css).not.toContain('.bg-_b_h123455_B')
    expect(second.rawCss).not.toContain('.bg-\\[\\#123455\\]')
    expect(second.incrementalCss).toBeUndefined()
    expect(second.incrementalRawCss).toBeUndefined()
    expect(second.classSet).toEqual(new Set(['bg-blue-500']))
    expect(second.rawCandidates).toEqual(new Set(['bg-blue-500']))
  })

  it('replays exact v3 incremental results when utilities roll back', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })
    const second = await engine.generate({
      candidates: ['bg-blue-500', 'bg-[#123455]'],
      incrementalCache: true,
    })
    const rollback = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })

    expect(second.css).toContain('.bg-_b_h123455_B')
    expect(rollback.css).toBe(first.css)
    expect(rollback.rawCss).toBe(first.rawCss)
    expect(rollback.css).not.toContain('.bg-_b_h123455_B')
    expect(rollback.rawCandidates).toEqual(new Set(['bg-blue-500']))
  })

  it('shrinks the v3 incremental context after utilities roll back', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    await engine.generate({
      candidates: ['bg-blue-500', 'bg-[#123455]'],
      incrementalCache: true,
    })
    const rollback = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })
    const next = await engine.generate({
      candidates: ['bg-blue-500', 'bg-[#654321]'],
      incrementalCache: true,
    })

    expect(rollback.css).not.toContain('.bg-_b_h123455_B')
    expect(next.css).toContain('.bg-blue-500')
    expect(next.css).toContain('.bg-_b_h654321_B')
    expect(next.css).not.toContain('.bg-_b_h123455_B')
    expect(next.rawCandidates).toEqual(new Set(['bg-blue-500', 'bg-[#654321]']))
  })

  it('keeps custom component classes referenced by @apply in v3 generator output', async () => {
    const source = await resolveTailwindV3Source({
      css: [
        '@tailwind components;',
        '@tailwind utilities;',
        '@layer components {',
        '  .raw-btn {',
        '    @apply after:border-none inline-flex items-center gap-2 rounded text-sm font-semibold transition-all;',
        '  }',
        '  .btn {',
        '    @apply raw-btn bg-gradient-to-r from-[#9e58e9] to-blue-500 px-2 py-1 text-white;',
        '  }',
        '}',
      ].join('\n'),
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['btn'],
    })
    const webResult = await engine.generate({
      target: 'web',
      candidates: ['btn'],
    })
    const css = compactCss(result.css)
    const webCss = compactCss(webResult.css)

    expect(result.css).not.toContain('@layer')
    expect(css).toContain('.raw-btn{display:inline-flex')
    expect(css).toContain('.raw-btn::after{content:var(--tw-content);border-style:none}')
    expect(css).toContain('.btn{display:inline-flex')
    expect(css).toContain('.btn::after{content:var(--tw-content);border-style:none}')
    expect(css).toContain('background-image:linear-gradient(toright,var(--tw-gradient-stops))')
    expect([...result.classSet]).toEqual(expect.arrayContaining(['btn', 'raw-btn']))
    expect(webResult.css).toBe(webResult.rawCss)
    expect(webResult.css).not.toContain('@layer')
    expect(webCss).toContain('.raw-btn{display:inline-flex')
    expect(webCss).toContain('.btn{display:inline-flex')
  })

  it('supports Tailwind v3 functions and directives in generator output', async () => {
    const source = await resolveTailwindV3Source({
      css: [
        '@tailwind base;',
        '@tailwind components;',
        '@tailwind utilities;',
        '@tailwind variants;',
        '@layer utilities {',
        '  .filter-none {',
        '    filter: none;',
        '  }',
        '  .filter-grayscale {',
        '    filter: grayscale(100%);',
        '  }',
        '}',
        '@layer components {',
        '  .btn-blue {',
        '    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;',
        '  }',
        '}',
        '@layer base {',
        '  h1 {',
        '    @apply text-2xl;',
        '  }',
        '  h2 {',
        '    @apply text-xl;',
        '  }',
        '}',
        '.brand-card {',
        '  color: theme("colors.blue.500");',
        '}',
        '@media screen(md) {',
        '  .screen-md-card {',
        '    @apply text-xl;',
        '  }',
        '}',
      ].join('\n'),
      base: process.cwd(),
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['btn-blue', 'brand-card', 'screen-md-card'],
      styleOptions: {
        isMainChunk: false,
      },
    })
    const css = compactCss(result.css)
    const rawCss = compactCss(result.rawCss)
    const h1Index = rawCss.indexOf('h1{font-size:1.5rem')
    const buttonIndex = rawCss.indexOf('.btn-blue{')
    const filterIndex = rawCss.indexOf('.filter-none{')

    expect(rawCss).toContain('h1{font-size:1.5rem')
    expect(rawCss).toContain('h2{font-size:1.25rem')
    expect(h1Index).toBeGreaterThanOrEqual(0)
    expect(buttonIndex).toBeGreaterThan(h1Index)
    expect(filterIndex).toBeGreaterThan(buttonIndex)
    expect(css).toContain('.btn-blue{border-radius:0.25rem')
    expect(css).toContain('background-color:rgba(59,130,246')
    expect(rawCss).toContain('.btn-blue:hover')
    expect(rawCss).toContain('2978216')
    expect(css).toContain('.filter-none{filter:none;}')
    expect(css).toContain('.filter-grayscale{filter:grayscale(100%);}')
    expect(css).toContain('.brand-card{color:#3b82f6;}')
    expect(css).toContain('@media(min-width:768px){.screen-md-card{font-size:1.25rem')
    expect(css).not.toContain('@tailwind')
    expect(css).not.toContain('@apply')
    expect(css).not.toContain('theme(')
    expect(css).not.toContain('screen(')
    expect([...result.classSet]).toEqual(expect.arrayContaining([
      'btn-blue',
      'filter-none',
      'filter-grayscale',
      'text-2xl',
      'text-xl',
    ]))
  })

  it('resolves Tailwind v3 @config directives before generation', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v3-config-'))
    await writeFile(path.join(root, 'tailwind.config.cjs'), [
      'module.exports = {',
      '  content: [],',
      '  theme: {',
      '    extend: {',
      '      colors: { brand: "#123456" },',
      '    },',
      '  },',
      '}',
    ].join('\n'), 'utf8')
    const source = await resolveTailwindV3Source({
      css: [
        '@config "./tailwind.config.cjs";',
        '@tailwind utilities;',
      ].join('\n'),
      base: root,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['bg-brand'],
    })

    expect(source.config).toBe(path.join(root, 'tailwind.config.cjs'))
    expect(result.rawCss).toContain('.bg-brand')
    expect(result.rawCss).toContain('18 52 86')
    expect(result.rawCss).not.toContain('@config')
  })

  it('falls back when the patch fast path cannot resolve Tailwind v3 from the project cwd', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v3-patch-missing-'))
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: root,
      cwd: root,
      config: undefined,
    })
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['bg-[#123456]'],
    })

    expect(result.classSet).toEqual(new Set(['bg-[#123456]']))
    expect(result.css).toContain('.bg-_b_h123456_B')
    expect(result.rawCss).toContain('.bg-\\[\\#123456\\]')
  })

  it('does not rescan configured content when explicit candidates drive v3 incremental generation', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind utilities;',
      base: process.cwd(),
      config: undefined,
    })
    source.configObject = {
      content: [
        {
          raw: '<view class="text-[88rpx] bg-[#4268EA]"></view>',
          extension: 'html',
        },
      ],
    }
    const engine = createTailwindV3Engine(source)

    const first = await engine.generate({
      candidates: ['bg-[#4268EA]'],
      incrementalCache: true,
    })
    const second = await engine.generate({
      candidates: ['bg-[#4268EA]', 'bg-[red]'],
      incrementalCache: true,
    })

    expect(first.classSet).toEqual(new Set(['bg-[#4268EA]']))
    expect(first.css).toContain('.bg-_b_h4268EA_B')
    expect(first.css).not.toContain('88rpx')
    expect(second.classSet).toEqual(new Set(['bg-[#4268EA]', 'bg-[red]']))
    expect(second.css).toContain('.bg-_bred_B')
    expect(second.css).not.toContain('88rpx')
    expect(second.css.length - first.css.length).toBeLessThan(400)
    expect(second.css.match(/\.bg-_b_h4268EA_B/g) ?? []).toHaveLength(1)
  })

  it('normalizes default export configs before generating plugin components', async () => {
    const source = await resolveTailwindV3Source({
      css: '@tailwind components;',
      base: process.cwd(),
      config: undefined,
    })
    source.configObject = {
      default: {
        content: [],
        plugins: [
          plugin(({ addComponents }) => {
            addComponents({
              '.weapp-reset-button': {
                padding: '0',
              },
            })
          }),
        ],
      },
    } as never
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: ['weapp-reset-button'],
    })

    expect(result.css).toContain('.weapp-reset-button')
    expect(result.css).toContain('padding: 0')
  })
})
