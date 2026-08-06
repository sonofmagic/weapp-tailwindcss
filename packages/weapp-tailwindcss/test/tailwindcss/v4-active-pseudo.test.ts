import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

async function createEngine() {
  const source = await resolveTailwindV4Source({
    base: process.cwd(),
    css: `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
}
@tailwind utilities;
`,
  })
  return createTailwindV4Engine(source)
}

const candidates = [
  'bg-blue-500',
  'active:bg-blue-500',
  'group-active:bg-blue-500',
  'not-active:bg-blue-500',
]

describe('tailwindcss v4 active pseudo class', () => {
  it('removes active selectors from mini-program css by default without changing the class set', async () => {
    const generated = await (await createEngine()).generate({ candidates })

    expect(generated.css).toContain('.bg-blue-500')
    expect(generated.css).not.toContain(':active')
    expect(generated.classSet).toEqual(new Set(candidates))
  })

  it('keeps active selectors when mini-program removal is disabled', async () => {
    const generated = await (await createEngine()).generate({
      candidates,
      styleOptions: {
        cssRemoveActivePseudoClass: false,
      },
    })

    expect(generated.css).toContain(':active')
  })

  it('keeps active selectors for web targets', async () => {
    const generated = await (await createEngine()).generate({
      candidates,
      target: 'web',
    })

    expect(generated.css).toContain('.active\\:bg-blue-500:active')
    expect(generated.css).toContain(':active')
  })
})
