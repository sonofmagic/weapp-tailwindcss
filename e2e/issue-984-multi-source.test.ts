import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import { WeappTailwindcss } from '../packages/weapp-tailwindcss/src/bundlers/vite'

const require = createRequire(import.meta.url)
const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

async function readBuiltCss(root: string) {
  const cssFiles: string[] = []

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(file)
      }
      else if (entry.isFile() && file.endsWith('.css')) {
        cssFiles.push(file)
      }
    }))
  }

  await walk(root)
  expect(cssFiles.length).toBeGreaterThan(0)
  return (await Promise.all(cssFiles.map(file => readFile(file, 'utf8')))).join('\n')
}

describe('issue #984 monorepo source roots', () => {
  it('generates candidates from app and package source roots together', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-issue-984-'))
    try {
      const appRoot = path.join(root, 'apps/template')
      const appSource = path.join(appRoot, 'src')
      const appDist = path.join(appRoot, 'dist')
      const uiSource = path.join(root, 'packages/ui/src')
      const nodeModules = path.join(root, 'node_modules')
      const cssEntry = path.join(appSource, 'app.css')
      const output = path.join(root, 'output')

      await mkdir(appSource, { recursive: true })
      await mkdir(appDist, { recursive: true })
      await mkdir(uiSource, { recursive: true })
      await mkdir(nodeModules, { recursive: true })
      await symlink(tailwindcssV4Root, path.join(nodeModules, 'tailwindcss'), 'dir')
      await writeFile(cssEntry, [
        '@import "tailwindcss";',
        '@source "./**/*.{wxml,ts,js,vue}";',
        '@source "../../../packages/ui/src/**/*.{wxml,ts,js,vue}";',
        '@source not "../dist/**";',
      ].join('\n'), 'utf8')
      await writeFile(path.join(appSource, 'main.ts'), 'import "./app.css"', 'utf8')
      await writeFile(path.join(appSource, 'page.wxml'), '<view class="bg-[#123457]"></view>', 'utf8')
      await writeFile(path.join(uiSource, 'button.wxml'), '<view class="text-[#456789]"></view>', 'utf8')
      await writeFile(path.join(appDist, 'ignored.wxml'), '<view class="border-[#abcdef]"></view>', 'utf8')

      await build({
        build: {
          emptyOutDir: true,
          outDir: output,
          rollupOptions: {
            input: path.join(appSource, 'main.ts'),
          },
        },
        configFile: false,
        logLevel: 'silent',
        plugins: [
          WeappTailwindcss({
            appType: 'weapp-vite',
            cssEntries: [cssEntry],
            tailwindcss: {
              packageName: 'tailwindcss',
              version: 4,
              v4: {
                cssEntries: [cssEntry],
              },
            },
            tailwindcssBasedir: root,
          })!,
        ].flat(),
        root: appRoot,
      })

      const css = await readBuiltCss(output)
      expect(css).toContain('.bg-_b_h123457_B')
      expect(css).toContain('.text-_b_h456789_B')
      expect(css).not.toContain('.border-_b_habcdef_B')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
