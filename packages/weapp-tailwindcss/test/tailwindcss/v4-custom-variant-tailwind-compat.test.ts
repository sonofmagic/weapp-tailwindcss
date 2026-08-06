import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

const sourceCss = `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --color-black: #000;
}

@custom-variant theme-midnight {
  &:where([data-theme="midnight"] *) {
    @slot;
  }
}

@custom-variant theme-dawn (&:where([data-theme="dawn"] *));

@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}

@custom-variant web-focus {
  &:focus {
    /* #ifndef MP */
    @slot;
    /* #endif */
  }
}

/* #ifdef MP */
@custom-variant mini-focus {
  &:focus {
    @slot;
  }
}
/* #endif */

@tailwind utilities;
`

const candidates = [
  'theme-midnight:bg-blue-500',
  'theme-dawn:bg-black',
  'any-hover:bg-blue-500',
  'web-focus:bg-black',
  'mini-focus:bg-blue-500',
]

async function createEngine() {
  const source = await resolveTailwindV4Source({
    base: process.cwd(),
    css: sourceCss,
  })
  return createTailwindV4Engine(source)
}

describe('tailwindcss v4 custom variant compatibility', () => {
  it.each(['mp-weixin', 'mp-alipay', 'mp-toutiao'])('supports all documented custom variant forms on %s', async (platform) => {
    const generated = await (await createEngine()).generate({
      candidates,
      styleOptions: { platform },
    })
    expect(generated.rawCss).toContain('.theme-midnight\\:bg-blue-500:where([data-theme="midnight"] *)')
    expect(generated.rawCss).toContain('.theme-dawn\\:bg-black:where([data-theme="dawn"] *)')
    expect(generated.rawCss).toContain('@media (any-hover: hover)')
    expect(generated.css).toContain('theme-midnight_cbg-blue-500[data-theme="midnight"]')
    expect(generated.css).toContain('[data-theme="midnight"]')
    expect(generated.css).toContain('theme-dawn_cbg-black[data-theme="dawn"]')
    expect(generated.css).toContain('[data-theme="dawn"]')
    expect(generated.css).toContain('mini-focus')
    expect(generated.css).not.toContain('web-focus')
    expect(generated.css).not.toContain('any-hover')
  })

  it('supports all documented custom variant forms on H5', async () => {
    const generated = await (await createEngine()).generate({
      candidates,
      styleOptions: { platform: 'h5' },
      target: 'web',
    })

    expect(generated.css).toContain('theme-midnight')
    expect(generated.css).toContain('[data-theme="midnight"]')
    expect(generated.css).toContain('theme-dawn')
    expect(generated.css).toContain('[data-theme="dawn"]')
    expect(generated.css).toContain('any-hover')
    expect(generated.css).toContain('web-focus')
    expect(generated.css).not.toContain('mini-focus')
    expect(generated.css).not.toContain('@weapp-tw-ifdef')
    expect(generated.css).not.toContain('@weapp-tw-ifndef')
  })
})
