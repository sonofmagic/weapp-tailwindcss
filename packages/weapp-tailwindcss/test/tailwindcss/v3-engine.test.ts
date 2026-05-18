import path from 'node:path'
import { createTailwindV3Engine, resolveTailwindV3Source, transformTailwindV3CssToWeapp } from '@/tailwindcss/v3-engine'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import plugin from 'tailwindcss/plugin'

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

describe('tailwindcss v3 engine', () => {
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
    expect(compactCss(result.css)).toContain('view,text,::before,::after{')
    expect(result.css).toContain('box-sizing: border-box')
    expect(result.css).toContain('border-width: 0')
    expect(result.css).toContain('border-style: solid')
    expect(result.css).toContain('border-color:')
    expect(result.css).not.toContain(':host,page,.tw-root,wx-root-portal-content')
    expect(result.css).not.toContain('button')
    expect(result.css).not.toContain('::-webkit')
    expect(result.css).toMatch(/^::before,\s*::after\s*\{\s*--tw-content:/m)
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
    expect(css).toContain('view,text,::before,::after{')
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
    expect(second.classSet).toEqual(new Set(['bg-blue-500', 'bg-[#123455]']))
    expect(second.css.match(/\.bg-blue-500/g) ?? []).toHaveLength(1)
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
