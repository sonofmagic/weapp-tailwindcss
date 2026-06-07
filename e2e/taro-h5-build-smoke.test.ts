import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'
import { taroWebHmrCases } from './taro-web-demo-hmr-cases'

const repoRoot = path.resolve(__dirname, '..')
const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/
const textOutputRE = /\.(?:html|js|css|scss|less|sass|styl|json)$/i

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
      expect(packageJson.scripts?.['build:h5'], `${item.name} should expose build:h5`).toContain('taro build --type h5')
    }
  })

  it.each(taroWebHmrCases)('builds H5 output for $name', async (item) => {
    const projectRoot = await runTaroH5Build(item.projectDir)
    const outputRoot = path.resolve(projectRoot, 'dist')
    const indexHtml = path.resolve(outputRoot, 'index.html')
    await expect(fs.access(indexHtml)).resolves.toBeUndefined()

    const output = await readTextOutputs(outputRoot)
    expect(output.length, `${item.name} should emit readable H5 output`).toBeGreaterThan(0)
    expect(output, `${item.name} should not leave raw Tailwind directives in H5 output`).not.toMatch(rawTailwindDirectiveRE)
  }, 1_200_000)
})
