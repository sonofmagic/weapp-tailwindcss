import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from '@/generator'

const MINIMAL_THEME_CSS = `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

describe('weapp-tailwindcss generator', () => {
  it('generates mini-program css by default', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const generator = createWeappTailwindcssGenerator(source)

    const result = await generator.generate({
      candidates: ['hover:bg-blue-500', 'w-[100px]'],
    })

    expect(result.target).toBe('weapp')
    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).not.toContain(':hover')
    expect(result.css).not.toContain('@supports')
    expect(result.rawCss).toContain('.w-\\[100px\\]')
  })

  it('keeps h5 output as Tailwind v4 browser css', async () => {
    const source = await resolveTailwindV4Source({
      css: MINIMAL_THEME_CSS,
      base: process.cwd(),
    })
    const generator = createWeappTailwindcssGenerator(source)

    const result = await generator.generate({
      target: 'h5',
      candidates: ['hover:bg-blue-500', 'w-[100px]'],
    })

    expect(result.target).toBe('h5')
    expect(result.css).toBe(result.rawCss)
    expect(result.css).toContain('.hover\\:bg-blue-500')
    expect(result.css).toContain('@media (hover: hover)')
  })
})
