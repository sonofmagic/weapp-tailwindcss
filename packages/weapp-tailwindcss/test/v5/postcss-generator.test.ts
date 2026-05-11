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
const repositoryRoot = path.resolve(__dirname, '../../../..')

describe('v5 postcss generator', () => {
  it('generates mini-program css from tailwind v4 input by default', async () => {
    const result = await postcss([
      weappTailwindcss({
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
        scanSources: false,
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
        packageName: 'tailwindcss4',
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
        scanSources: false,
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

  it('keeps web target aligned with native Tailwind v4 defaults by default', async () => {
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
        packageName: 'tailwindcss4',
        candidates: ['ring', 'border', 'shadow-sm'],
        scanSources: false,
      }),
    ]).process(`
      @theme default {
        --color-blue-500: #3b82f6;
        --color-gray-200: #e5e7eb;
        --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      }
      @tailwind utilities;
    `, {
      from: undefined,
    })

    expect(result.css).not.toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('calc(1px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))')
  })

  it('passes explicit Tailwind v3 compatibility opt-in through postcss generator options', async () => {
    const result = await postcss([
      weappTailwindcss({
        generator: {
          tailwindcssV3Compatibility: true,
          target: 'web',
        },
        packageName: 'tailwindcss4',
        candidates: ['ring', 'border', 'shadow-sm'],
        scanSources: false,
      }),
    ]).process(`
      @theme default {
        --color-blue-500: #3b82f6;
        --color-gray-200: #e5e7eb;
        --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      }
      @tailwind utilities;
    `, {
      from: undefined,
    })

    expect(result.css).toContain('border-color: var(--color-gray-200, currentcolor)')
    expect(result.css).toContain('calc(3px + var(--tw-ring-offset-width))')
    expect(result.css).toContain('--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))')
  })

  it('uses generator target option for v4 web output', async () => {
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
        packageName: 'tailwindcss4',
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
        scanSources: false,
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

  it('discovers default source files relative to the current postcss input file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-auto-'))
    const cssEntry = path.join(root, 'app.css')
    const sourceDir = path.join(root, 'src')
    const pageEntry = path.join(sourceDir, 'page.wxml')
    const ignoredEntry = path.join(sourceDir, 'ignored.wxml')
    await mkdir(sourceDir)
    await writeFile(pageEntry, '<view class="bg-blue-500 w-[100px]"></view>', 'utf8')
    await writeFile(ignoredEntry, '<view class="text-[55rpx]"></view>', 'utf8')

    const result = await postcss([
      weappTailwindcss(),
    ]).process(`
      @theme default {
        --color-blue-500: oklch(62.3% 0.214 259.815);
      }
      @source not "./src/ignored.wxml";
      @tailwind utilities;
    `, {
      from: cssEntry,
    })

    expect(result.css).toContain('.bg-blue-500')
    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).not.toContain('.text-_b55rpx_B')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'weapp',
    }))
  })

  it('honors Tailwind v4 inline source detection in postcss generator mode', async () => {
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
        packageName: 'tailwindcss4',
      }),
    ]).process(`
      @theme default {
        --color-red-100: #fee2e2;
        --color-red-200: #fecaca;
        --color-red-300: #fca5a5;
        --spacing: 0.25rem;
      }
      @source not ".";
      @source inline("{hover:,focus:,}underline w-{1..3}");
      @source inline("bg-red-{100..300..100}");
      @source not inline("focus:underline");
      @tailwind utilities;
    `, {
      from: undefined,
    })

    expect(result.css).toContain('.underline')
    expect(result.css).toContain('.hover\\:underline')
    expect(result.css).not.toContain('.focus\\:underline')
    expect(result.css).toContain('.w-1')
    expect(result.css).toContain('.w-2')
    expect(result.css).toContain('.w-3')
    expect(result.css).toContain('.bg-red-100')
    expect(result.css).toContain('.bg-red-200')
    expect(result.css).toContain('.bg-red-300')
    expect(result.css).not.toContain('@source')
  })

  it('resolves @config paths relative to the current postcss input file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-config-'))
    const sourceDir = path.join(root, 'src')
    const cssEntry = path.join(sourceDir, 'app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    await mkdir(sourceDir)
    await writeFile(configFile, 'export default { theme: { extend: { colors: { brand: "#123456" } } } }', 'utf8')

    const result = await postcss([
      weappTailwindcss({
        projectRoot: repositoryRoot,
        packageName: 'tailwindcss4',
        candidates: ['bg-brand'],
      }),
    ]).process(`
      @config "../tailwind.config.js";
      @tailwind utilities;
    `, {
      from: cssEntry,
    })

    expect(result.css).toContain('.bg-brand')
    expect(result.css).toContain('#123456')
  })

  it('uses generator config for tailwind v4 source generation', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-generator-config-'))
    const cssEntry = path.join(root, 'app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    await writeFile(configFile, 'export default { theme: { extend: { colors: { brand: "#123456" } } } }', 'utf8')

    const result = await postcss([
      weappTailwindcss({
        packageName: 'tailwindcss4',
        candidates: ['bg-brand'],
        generator: {
          config: configFile,
        },
      }),
    ]).process('@tailwind utilities;', {
      from: cssEntry,
    })

    expect(result.css).toContain('.bg-brand')
    expect(result.css).toContain('#123456')
  })

  it('generates mini-program css from tailwind v3 config content without v4 @source', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-v3-'))
    const sourceDir = path.join(root, 'src')
    const cssEntry = path.join(root, 'app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    const pageEntry = path.join(sourceDir, 'page.wxml')
    await mkdir(sourceDir)
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{wxml,js}"], theme: { extend: { colors: { brand: "#123456" } } } }', 'utf8')
    await writeFile(pageEntry, '<view class="w-[300.31rpx] bg-brand hover:bg-blue-500"></view>', 'utf8')

    const cwd = process.cwd()
    process.chdir(root)
    try {
      const result = await postcss([
        weappTailwindcss({
          version: 3,
          config: configFile,
        }),
      ]).process('@tailwind utilities;', {
        from: cssEntry,
      })

      expect(result.css).toContain('.w-_b300_d31rpx_B')
      expect(result.css).toContain('width: 300.31rpx')
      expect(result.css).toContain('.bg-brand')
      expect(result.css).not.toContain(':hover')
      expect(result.messages).toContainEqual(expect.objectContaining({
        type: 'weapp-tailwindcss:generated',
        target: 'weapp',
      }))
      expect(result.messages).toContainEqual(expect.objectContaining({
        type: 'dependency',
        file: configFile,
      }))
    }
    finally {
      process.chdir(cwd)
    }
  })

  it('uses generator config for tailwind v3 source generation', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-v3-generator-config-'))
    const sourceDir = path.join(root, 'src')
    const cssEntry = path.join(root, 'app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    const pageEntry = path.join(sourceDir, 'page.wxml')
    await mkdir(sourceDir)
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{wxml,js}"], theme: { extend: { colors: { brand: "#123456" } } } }', 'utf8')
    await writeFile(pageEntry, '<view class="bg-brand"></view>', 'utf8')

    const cwd = process.cwd()
    process.chdir(root)
    try {
      const result = await postcss([
        weappTailwindcss({
          version: 3,
          generator: {
            config: configFile,
          },
        }),
      ]).process('@tailwind utilities;', {
        from: cssEntry,
      })

      expect(result.css).toContain('.bg-brand')
      expect(result.css).toContain('18, 52, 86')
      expect(result.messages).toContainEqual(expect.objectContaining({
        type: 'dependency',
        file: configFile,
      }))
    }
    finally {
      process.chdir(cwd)
    }
  })

  it('resolves tailwind v3 @config paths relative to the current postcss input file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v5-postcss-v3-config-'))
    const sourceDir = path.join(root, 'src')
    const cssEntry = path.join(sourceDir, 'app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    await mkdir(sourceDir)
    await writeFile(configFile, 'module.exports = { theme: { extend: { colors: { brand: "#123456" } } } }', 'utf8')

    const result = await postcss([
      weappTailwindcss({
        version: 3,
        candidates: ['bg-brand', 'w-[100px]'],
      }),
    ]).process(`
      @config "../tailwind.config.js";
      @tailwind utilities;
    `, {
      from: cssEntry,
    })

    expect(result.css).toContain('.bg-brand')
    expect(result.css).toContain('18, 52, 86')
    expect(result.css).toContain('.w-_b100px_B')
  })

  it('treats generator false as the default generator path', async () => {
    const css = '.card { color: red; }'
    const result = await postcss([
      weappTailwindcss({
        candidates: ['w-[100px]'],
      }),
    ]).process(css, {
      from: undefined,
    })

    expect(result.css).toBe(css)
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
    }))
  })
})
