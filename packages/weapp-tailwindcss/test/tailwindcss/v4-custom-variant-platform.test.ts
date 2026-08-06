import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

async function createEngine() {
  const source = await resolveTailwindV4Source({
    base: process.cwd(),
    css: `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
}
@custom-variant inner-web {
  &:focus {
    /* #ifndef MP */
    @slot;
    /* #endif */
  }
}
/* #ifndef MP */
@custom-variant outer-web {
  &:focus {
    @slot;
  }
}
/* #endif */
@custom-variant inner-mp {
  &:focus {
    /* #ifdef MP */
    @slot;
    /* #endif */
  }
}
/* #ifdef MP */
@custom-variant outer-mp {
  &:focus {
    @slot;
  }
}
/* #endif */
@tailwind utilities;
`,
  })
  return createTailwindV4Engine(source)
}

const candidates = [
  'inner-web:bg-blue-500',
  'outer-web:bg-blue-500',
  'inner-mp:bg-blue-500',
  'outer-mp:bg-blue-500',
]

describe('tailwindcss v4 platform custom variants', () => {
  it('treats inner and outer conditional comment syntax equally for mini-program targets', async () => {
    const generated = await (await createEngine()).generate({
      candidates,
      styleOptions: { platform: 'mp-weixin' },
    })

    expect(generated.rawCss).toContain('inner-mp')
    expect(generated.rawCss).toContain('outer-mp')
    expect(generated.css).not.toContain('inner-mp')
    expect(generated.css).not.toContain('outer-mp')
    expect(generated.css).not.toContain('inner-web')
    expect(generated.css).not.toContain('outer-web')
  })

  it('treats inner and outer conditional comment syntax equally for web targets', async () => {
    const generated = await (await createEngine()).generate({
      candidates,
      styleOptions: { platform: 'h5' },
      target: 'web',
    })

    expect(generated.css).toContain('inner-web')
    expect(generated.css).toContain('outer-web')
    expect(generated.css).not.toContain('inner-mp')
    expect(generated.css).not.toContain('outer-mp')
  })
})
