import { readFile } from 'node:fs/promises'
import path from 'pathe'
import { describe, expect, it } from 'vitest'

const repositoryRoot = path.resolve(__dirname, '../../../..')
const demoRoot = path.resolve(repositoryRoot, 'demo/issue-uview-plus-cssentries')

function readDemoFile(file: string) {
  return readFile(path.resolve(demoRoot, file), 'utf8')
}

describe('issue-uview-plus-cssentries regression demo', () => {
  it('keeps the user repro wired to cssEntries, rem2rpx and uview-plus styles', async () => {
    const [packageJson, viteConfig, mainEntry, uviewStyle, page] = await Promise.all([
      readDemoFile('package.json').then(content => JSON.parse(content) as { name?: string, dependencies?: Record<string, string> }),
      readDemoFile('vite.config.ts'),
      readDemoFile('src/main.ts'),
      readDemoFile('src/styles/uview.scss'),
      readDemoFile('src/pages/demonstration/index.vue'),
    ])

    expect(packageJson.name).toBe('@weapp-tailwindcss-demo/issue-uview-plus-cssentries')
    expect(packageJson.dependencies).toHaveProperty('uview-plus')
    expect(viteConfig).toContain('WeappTailwindcss')
    expect(viteConfig).toContain('cssEntries')
    expect(viteConfig).toContain('src/styles/tailwindcss.css')
    expect(viteConfig).toContain('cssOptions')
    expect(viteConfig).toContain('rem2rpx: true')
    expect(viteConfig).not.toContain('process.cwd()')
    expect(mainEntry).toContain('import "./styles/tailwindcss.css"')
    expect(mainEntry).toContain('import "./styles/uview.scss"')
    expect(uviewStyle).toContain('@import "uview-plus/index.scss"')
    expect(page).toContain('<up-button')
  })
})
