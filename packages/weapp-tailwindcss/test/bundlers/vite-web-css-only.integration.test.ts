import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import { WeappTailwindcss } from '@/bundlers/vite'
import { WeappTailwindcssWeb } from '@/vite-web'

describe('vite/web CSS-only 真实构建', () => {
  async function buildFixture(plugins: ReturnType<typeof WeappTailwindcssWeb>) {
    const root = await mkdtemp(path.join(process.cwd(), '.tmp-vite-web-css-only-'))
    try {
      await writeFile(path.join(root, 'index.html'), '<script type="module" src="/main.ts"></script><div class="text-red-500 bg-slate-100">hello</div>')
      await writeFile(path.join(root, 'main.css'), '@import "tailwindcss";\n@source "./index.html";')
      await writeFile(path.join(root, 'main.ts'), 'import "./main.css"; console.log("text-blue-500")')

      await build({
        root,
        configFile: false,
        plugins,
        build: {
          cssMinify: false,
          sourcemap: true,
        },
      })

      const outputDir = path.join(root, 'dist')
      const assetsDir = path.join(outputDir, 'assets')
      const files = await readdir(assetsDir)
      const cssFile = files.find(file => file.endsWith('.css'))
      const jsFile = files.find(file => file.endsWith('.js'))
      expect(cssFile).toBeDefined()
      expect(jsFile).toBeDefined()
      const css = await readFile(path.join(assetsDir, cssFile!), 'utf8')
      const js = await readFile(path.join(assetsDir, jsFile!), 'utf8')
      expect(css).toContain('.text-red-500')
      expect(css).toContain('.bg-slate-100')
      expect(js).toContain('text-blue-500')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  }

  it('专用入口生成 Web CSS，但不改写 HTML/JavaScript', async () => {
    await buildFixture(WeappTailwindcssWeb())
  }, 30_000)

  it('主入口自动识别 Generic Web 后复用 CSS-only profile', async () => {
    await buildFixture(WeappTailwindcss())
  }, 30_000)
})
