import { createTailwindV3Engine, resolveTailwindV3Source } from '@/tailwindcss/v3-engine'

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
    expect(result.css).not.toMatch(/^::(?:before|after)/m)
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
})
