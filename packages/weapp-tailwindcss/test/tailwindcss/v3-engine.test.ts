import { createTailwindV3Engine, resolveTailwindV3Source } from '@/tailwindcss/v3-engine'
import plugin from 'tailwindcss/plugin'

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

describe('tailwindcss v3 engine', () => {
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
    expect(result.css).not.toContain('button')
    expect(result.css).not.toContain('::-webkit')
    expect(result.css).toMatch(/^::before,\s*::after\s*\{\s*--tw-content:/m)
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
