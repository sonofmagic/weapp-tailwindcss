import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

const MINIMAL_THEME_CSS = `
@theme default {
  --color-red-500: oklch(63.7% 0.237 25.331);
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

describe('tailwindcss v4 engine', () => {
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
