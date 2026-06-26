import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'

const projectRoot = path.resolve(__dirname, '../demo/uni-app-vite-tailwindcss-v4')
const cssOutputPattern = '**/*.{css,wxss,acss,qss}'
const textOutputPattern = '**/*.{html,js,css,wxml,wxss}'

async function buildPlatform(platform: 'mp-weixin' | 'h5') {
  await clearProjectBuildState(projectRoot)
  await execa('pnpm', ['run', `build:${platform}`], {
    cwd: projectRoot,
    stdio: process.env.E2E_DEBUG_BUILD === '1' ? 'inherit' : 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      UNI_BUILD_STRICT: '1',
      RUST_BACKTRACE: process.env.RUST_BACKTRACE ?? '1',
      npm_package_json: path.resolve(projectRoot, 'package.json'),
      INIT_CWD: projectRoot,
    },
  })
}

async function collectOutput(pattern: string, outputDir: string) {
  const root = path.resolve(projectRoot, outputDir)
  const files = await fg(pattern, {
    absolute: false,
    cwd: root,
    onlyFiles: true,
  })

  return Promise.all(files.sort().map(async (file) => {
    const absolutePath = path.join(root, file)
    return {
      file,
      text: await fs.readFile(absolutePath, 'utf8'),
    }
  }))
}

describe('uni-app vite vue3 Tailwind v4 cascade layer output', () => {
  it('unwraps custom cascade layers for mp-weixin css output', async () => {
    await buildPlatform('mp-weixin')

    const css = (await collectOutput(cssOutputPattern, 'dist/build/mp-weixin'))
      .map(entry => entry.text)
      .join('\n')

    expect(css, 'mp-weixin css should not keep unsupported @layer wrappers').not.toMatch(/@layer\b/)
    expect(css, 'mp-weixin css should keep custom Tailwind v4 layer rules').toMatch(/\.layer-card-v4\s*\{[\s\S]*?display:\s*flex/)
    expect(css, 'mp-weixin css should keep declarations inside custom Tailwind v4 layer rules').toMatch(/color:\s*var\(--color-midnight\)/)
  }, 600_000)

  it('uses web compatibility output for H5 css by default', async () => {
    await buildPlatform('h5')

    const output = (await collectOutput(textOutputPattern, 'dist/build/h5'))
      .map(entry => entry.text)
      .join('\n')

    expect(output, 'H5 output should remove native Tailwind v4 @layer wrappers by default').not.toMatch(/@layer\s+components/)
    expect(output, 'H5 output should keep custom Tailwind v4 layer rules').toMatch(/\.layer-card-v4\s*\{[\s\S]*?display:\s*flex/)
    expect(output, 'H5 output should keep declarations inside custom Tailwind v4 layer rules').toMatch(/color:\s*var\(--color-midnight\)/)
  }, 600_000)
})
