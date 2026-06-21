import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'

const demoRoot = path.resolve(__dirname, '../demo/weapp-vite-tailwindcss-v4')

async function readAllWxssFiles(root: string) {
  const files = await fg('dist/**/*.wxss', {
    absolute: true,
    cwd: root,
    onlyFiles: true,
  })
  return Promise.all(files.sort().map(async (file) => {
    return {
      file,
      content: await fs.readFile(file, 'utf8'),
    }
  }))
}

async function listLeakedPreprocessorFiles(root: string) {
  return fg('dist/**/*.{scss,sass,less,styl,stylus,pcss,postcss,sss}', {
    absolute: false,
    cwd: root,
    onlyFiles: true,
  })
}

describe('Tailwind v4 CSS source demo', () => {
  it('builds Tailwind v4 from a plain CSS root entry without leaking preprocessor output files', async () => {
    const appCss = await fs.readFile(path.join(demoRoot, 'tailwind.css'), 'utf8')
    expect(appCss).toContain('@import "tailwindcss";')
    expect(appCss).toContain('Tailwind v4 root entry intentionally uses plain CSS')

    await fs.rm(path.join(demoRoot, 'dist'), { recursive: true, force: true })
    await execa('pnpm', ['--filter', '@weapp-tailwindcss-demo/weapp-vite-tailwindcss-v4', 'build'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: process.env.E2E_DEBUG_BUILD === '1' ? 'inherit' : 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        BROWSERSLIST_ENV: 'production',
        npm_package_json: path.join(demoRoot, 'package.json'),
        INIT_CWD: demoRoot,
      },
    })

    const wxssFiles = await readAllWxssFiles(demoRoot)
    const leakedPreprocessorFiles = await listLeakedPreprocessorFiles(demoRoot)
    const pageWxss = await fs.readFile(path.join(demoRoot, 'dist/pages/index/index.wxss'), 'utf8')
    const joined = wxssFiles.map(item => item.content).join('\n')

    expect(leakedPreprocessorFiles).toEqual([])
    expect(pageWxss).toContain('.s .a')
    expect(pageWxss).toContain('color: turquoise;')
    expect(appCss).toContain('Tailwind v4 root entry intentionally uses plain CSS')
    expect(joined).toContain('.bg-_b_h111111_B')
    expect(joined).not.toContain('@import "tailwindcss"')
    expect(joined).not.toContain('@config "./tailwind.config.js"')
    expect(joined).not.toContain('$preprocessor')
    expect(joined).not.toContain('#{$')
  }, 120_000)
})
