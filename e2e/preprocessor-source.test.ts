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

describe('preprocessor Tailwind source demo', () => {
  it('builds Tailwind v4 from a real SCSS root entry without leaking preprocessor syntax', async () => {
    const appScss = await fs.readFile(path.join(demoRoot, 'app.scss'), 'utf8')
    expect(appScss).toContain('@import "tailwindcss";')
    expect(appScss).toContain('// Tailwind root entry intentionally lives in SCSS')

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
    const appWxss = await fs.readFile(path.join(demoRoot, 'dist/app.wxss'), 'utf8')
    const joined = wxssFiles.map(item => item.content).join('\n')

    expect(appWxss).toContain('--preprocessor-entry-marker: #1d4ed8;')
    expect(appWxss).toContain('.flex')
    expect(joined).not.toContain('@import "tailwindcss"')
    expect(joined).not.toContain('@config "./tailwind.config.js"')
    expect(joined).not.toContain('// Tailwind root entry intentionally lives in SCSS')
    expect(joined).not.toContain('$preprocessor')
    expect(joined).not.toContain('#{$')
  }, 120_000)
})
