import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'
import { taroWebHmrCases } from './taro-web-demo-hmr-cases'

const repoRoot = path.resolve(__dirname, '..')
const rawTailwindEntryDirectiveRE = /@(import\s+["']tailwindcss|tailwind|theme|source)\b/
const textOutputRE = /\.(?:html|js|css|scss|less|sass|styl|json)$/i
const cssOutputRE = /\.css$/i
const taroH5BuildRE = /(?:taro-build-runner\.mjs build|taro build)\s+--type h5/
const generatedCssRE = /\.(?:flex|grid|rounded|theme-mode-demo)\b|\.h-\\\[300px\\\]|\.bg-\\\[|\.text-\\\[/
const taroRuntimeCssRE = /\.taro-app-wrap\b|html,body\{width:100%;height:100%\}|body\{font-family:-apple-system-font/
const ordinaryProjectCssREByName = new Map<string, RegExp>([
  ['taro vite react Tailwind v4', /\.tw-page-style-watch-anchor\b/],
  ['taro vite react Tailwind v4', /\.tw-page-style-watch-anchor\b/],
  ['taro webpack react Tailwind v4', /\.(?:aspect-w-16|xxx)\b/],
  ['taro webpack react Tailwind v4', /\.tw-page-style-watch-anchor\b/],
  ['taro webpack vue3 Tailwind v4', /\.(?:aspect-w-16|xxx)\b/],
  ['taro webpack vue3 Tailwind v4', /\.tw-page-style-watch-anchor\b/],
])
const thirdPartyCssTokensByName = new Map<string, string[]>([
  ['taro webpack react Tailwind v4', [
    '--nutui-color-primary',
    '.nut-icon',
    '.nut-button',
    '.nut-button-primary',
  ]],
])

function shouldAssertTaroRuntimeCss(name: string) {
  return name.includes('vite')
}

async function readTextOutputs(outputRoot: string) {
  const files = await fg('**/*', {
    absolute: true,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const chunks: string[] = []
  for (const file of files.sort()) {
    if (textOutputRE.test(file)) {
      chunks.push(await fs.readFile(file, 'utf8'))
    }
  }
  return chunks.join('\n')
}

async function readCssOutputs(outputRoot: string) {
  const files = await fg('**/*.css', {
    absolute: true,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const chunks: string[] = []
  for (const file of files.sort()) {
    if (cssOutputRE.test(file)) {
      chunks.push(await fs.readFile(file, 'utf8'))
    }
  }
  return chunks.join('\n')
}

async function runTaroH5Build(projectDir: string) {
  const projectRoot = path.resolve(repoRoot, projectDir)
  await clearProjectBuildState(projectRoot)
  await execa('pnpm', ['run', 'build:h5'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      BROWSER: 'none',
      NODE_ENV: 'production',
    },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
  })
  return projectRoot
}

describe('demo Taro H5 build smoke', () => {
  it('keeps every Taro browser HMR case backed by a build:h5 script', async () => {
    for (const item of taroWebHmrCases) {
      const packageJson = JSON.parse(
        await fs.readFile(path.resolve(repoRoot, item.projectDir, 'package.json'), 'utf8'),
      ) as { scripts?: Record<string, string> }
      expect(packageJson.scripts?.['build:h5'], `${item.name} should expose build:h5`).toMatch(taroH5BuildRE)
    }
  })

  it.each(taroWebHmrCases)('builds H5 output for $name', async (item) => {
    const projectRoot = await runTaroH5Build(item.projectDir)
    const outputRoot = path.resolve(projectRoot, 'dist')
    const indexHtml = path.resolve(outputRoot, 'index.html')
    await expect(fs.access(indexHtml)).resolves.toBeUndefined()

    const output = await readTextOutputs(outputRoot)
    expect(output.length, `${item.name} should emit readable H5 output`).toBeGreaterThan(0)

    const css = await readCssOutputs(outputRoot)
    expect(css.length, `${item.name} should emit H5 css output`).toBeGreaterThan(0)
    expect(css, `${item.name} should not leave raw Tailwind entry directives in H5 CSS`).not.toMatch(rawTailwindEntryDirectiveRE)
    expect(css, `${item.name} should include generated Tailwind CSS`).toMatch(generatedCssRE)
    if (shouldAssertTaroRuntimeCss(item.name)) {
      expect(css, `${item.name} should preserve Taro H5 runtime CSS`).toMatch(taroRuntimeCssRE)
    }

    const ordinaryProjectCssRE = ordinaryProjectCssREByName.get(item.name)
    if (ordinaryProjectCssRE) {
      expect(css, `${item.name} should preserve ordinary project CSS`).toMatch(ordinaryProjectCssRE)
    }
    for (const token of thirdPartyCssTokensByName.get(item.name) ?? []) {
      expect(css, `${item.name} should preserve third-party CSS token ${token}`).toContain(token)
    }
  }, 1_200_000)
})
