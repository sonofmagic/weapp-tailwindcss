import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createTailwindV4Engine, resolveTailwindV4Source, resolveTailwindV4SourceOptionsFromPatcher } from '@/tailwindcss/v4-engine'

const MINIMAL_THEME_CSS = `
@theme default {
  --color-red-500: oklch(63.7% 0.237 25.331);
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

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

  it('scans compiled @source entries by default', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-engine-'))
    const srcDir = path.join(root, 'src')
    await writeFile(path.join(root, 'ignored.html'), '<view class="bg-blue-500"></view>', 'utf8')
    await mkdir(srcDir, { recursive: true })
    await writeFile(path.join(srcDir, 'index.html'), '<view class="bg-red-500"></view>', 'utf8')
    const source = await resolveTailwindV4Source({
      projectRoot: root,
      base: root,
      css: `
        @theme default {
          --color-red-500: oklch(63.7% 0.237 25.331);
          --color-blue-500: oklch(62.3% 0.214 259.815);
        }
        @source "./src/**/*.html";
        @tailwind utilities;
      `,
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()

    expect(result.classSet).toEqual(new Set(['bg-red-500']))
    expect(result.sources).toEqual([
      {
        base: root,
        pattern: './src/**/*.html',
        negated: false,
      },
    ])
    expect(result.rawCss).toContain('.bg-red-500')
    expect(result.rawCss).not.toContain('.bg-blue-500')
    expect(result.css).toContain('.bg-red-500')
    expect(result.css).not.toContain('.bg-blue-500')
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

  it('keeps cssEntries relative to the css file unless v4 base is explicitly configured', () => {
    const implicitBaseOptions = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            base: '/workspace/app',
            cssEntries: ['/workspace/app/src/app.css'],
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)
    const explicitBaseOptions = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            base: '/workspace/app',
            configuredBase: '/custom/base',
            cssEntries: ['/workspace/app/src/app.css'],
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)

    expect(implicitBaseOptions.base).toBeUndefined()
    expect(explicitBaseOptions.base).toBe('/custom/base')
  })

  it('passes configured v4 source entries through for bundler generation', () => {
    const sourceEntries = [
      {
        base: '/workspace/app',
        pattern: 'src/**/*.{vue,tsx,wxml}',
        negated: false,
      },
      {
        base: '/workspace/app',
        pattern: 'dist',
        negated: true,
      },
    ]
    const options = resolveTailwindV4SourceOptionsFromPatcher({
      options: {
        projectRoot: '/workspace/app',
        tailwind: {
          cwd: '/workspace/app',
          v4: {
            cssEntries: ['/workspace/app/src/app.css'],
            sources: sourceEntries,
          },
        },
      },
      packageInfo: { name: 'tailwindcss', version: '4.2.4' },
    } as any)

    expect(options.sources).toBe(sourceEntries)
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

  it('keeps Tailwind v3 default values in v4 generator output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --blur-sm: 8px;
          --radius-sm: 0.25rem;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: true,
      target: 'web',
      candidates: ['ring', 'border', 'shadow-sm', 'rounded-sm', 'blur-sm', 'outline'],
    })

    expect(result.css).toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
    expect(result.css).toContain('border-radius: var(--radius-sm)')
    expect(result.css).toContain('--tw-blur: blur(var(--blur-sm))')
    expect(result.css).toContain('--blur-sm: 4px')
    expect(result.css).toContain('outline-width: 3px')
  })

  it('uses Tailwind v3 compatibility default values for mini-program output by default', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['ring', 'border', 'shadow-sm'],
    })

    expect(result.css).toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.05))')
  })

  it('can opt out of Tailwind v3 compatibility default values for native Tailwind v4 output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --color-blue-500: #3b82f6;
          --color-gray-200: #e5e7eb;
          --blur-sm: 8px;
          --radius-sm: 0.25rem;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      tailwindcssV3Compatibility: false,
      target: 'web',
      candidates: ['ring', 'border', 'shadow-sm', 'rounded-sm', 'blur-sm', 'outline'],
    })

    expect(result.css).not.toContain('--default-ring-width: 3px')
    expect(result.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))')
    expect(result.css).not.toContain('--blur-sm: 4px')
    expect(result.css).toContain('outline-width: 1px')
  })

  it('expands spacing child combinators for view and text in mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --spacing: 0.25rem;
        }
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['space-y-4'],
    })
    const css = compactCss(result.css)

    expect(css).toContain('.space-y-4>view+view')
    expect(css).toContain('.space-y-4>view+text')
    expect(css).toContain('.space-y-4>text+view')
    expect(css).toContain('.space-y-4>text+text')
  })

  it('removes browser preflight while keeping utility variables for mini-program output', async () => {
    const source = await resolveTailwindV4Source({
      css: `
        @theme default {
          --spacing: 0.25rem;
        }
        @tailwind base;
        @tailwind utilities;
      `,
      base: process.cwd(),
    })
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate({
      candidates: ['transform', 'before:content-["x"]', 'w-4'],
    })

    expect(result.rawCss).toContain('::before')
    expect(result.css).toContain('.transform')
    expect(result.css).toContain('.w-4')
    expect(result.css).toContain('--tw-rotate-x')
    expect(result.css).toContain('--tw-content')
    expect(result.css).not.toContain('::-webkit')
    expect(result.css).not.toContain(':-moz')
    expect(result.css).toMatch(/^::before,\s*::after\s*\{\s*--tw-content:/m)
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
