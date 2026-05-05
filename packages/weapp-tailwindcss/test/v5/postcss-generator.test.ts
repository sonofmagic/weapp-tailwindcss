import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import weappTailwindcss from '@/postcss'

const MINIMAL_THEME_CSS = `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

describe('v5 postcss generator', () => {
  it('generates mini-program css from tailwind v4 input by default', async () => {
    const result = await postcss([
      weappTailwindcss({
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).toContain('width: 100px')
    expect(result.css).not.toContain(':hover')
    expect(result.css).not.toContain('@supports')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'weapp',
    }))
  })

  it('can generate web css from the same tailwind v4 input', async () => {
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toContain('.hover\\:bg-blue-500')
    expect(result.css).toContain('@media (hover: hover)')
    expect(result.css).toContain('.w-\\[100px\\]')
    expect(result.css).not.toContain('.w-_b100px_B')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'web',
    }))
  })

  it('keeps legacy flat target option for v4 compatibility', async () => {
    const result = await postcss([
      weappTailwindcss({
        target: 'web',
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toContain('.hover\\:bg-blue-500')
    expect(result.css).toContain('.w-\\[100px\\]')
    expect(result.css).not.toContain('.w-_b100px_B')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'web',
    }))
  })

  it('resolves @source paths relative to the current postcss input file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-'))
    const cssEntry = path.join(root, 'app.css')
    const sourceDir = path.join(root, 'src')
    const pageEntry = path.join(sourceDir, 'page.wxml')
    await mkdir(sourceDir)
    await writeFile(pageEntry, '<view class="w-[100px] bg-blue-500"></view>', 'utf8')

    const result = await postcss([
      weappTailwindcss(),
    ]).process(`
      @theme default {
        --color-blue-500: oklch(62.3% 0.214 259.815);
      }
      @source "./src";
      @tailwind utilities;
    `, {
      from: cssEntry,
    })

    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).toContain('width: 100px')
    expect(result.css).toContain('.bg-blue-500')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'dependency',
      file: pageEntry,
    }))
  })

  it('skips generation when generator is disabled', async () => {
    const css = '.card { color: red; }'
    const result = await postcss([
      weappTailwindcss({
        generator: false,
        candidates: ['w-[100px]'],
      }),
    ]).process(css, {
      from: undefined,
    })

    expect(result.css).toBe(css)
    expect(result.messages).not.toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
    }))
  })
})
