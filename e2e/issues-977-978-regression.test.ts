import fs from 'node:fs/promises'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { E2E_PROJECTS } from './projectEntries'
import { clearProjectBuildState, ensureProjectBuilt } from './projectTest'
import { getProjectCssFiles, projectFilter } from './shared'

const OUTPUT_REGRESSION_PROJECT_NAMES = new Set([
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])

const ISSUE_978_VARIABLES = [
  '--test-issue-978-color',
  '--color-issue-978',
  '--font-issue-978',
]

const ISSUE_977_OUTPUT_TOKENS = [
  '#0977ee',
  '31rpx',
  '29rpx',
]

async function readProjectCss(projectPath: string, cssFiles: string[]) {
  const files = new Set<string>()
  async function collect(dir: string) {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    }
    catch {
      return
    }
    await Promise.all(entries.map(async (entry) => {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await collect(file)
        return
      }
      if (entry.isFile() && /\.(?:wxss|acss|ttss|qss|jxss|css)$/.test(entry.name)) {
        files.add(file)
      }
    }))
  }

  await collect(projectPath)
  for (const cssFile of cssFiles) {
    const file = path.resolve(projectPath, cssFile)
    try {
      await fs.access(file)
      files.add(file)
    }
    catch {
      // 部分框架会把入口样式拆到带 hash 的真实产物中，递归扫描已覆盖这些文件。
    }
  }
  const parts = await Promise.all([...files].sort().map(file => fs.readFile(file, 'utf8')))
  return parts.join('\n')
}

describe('issues 977 and 978 demo regressions', () => {
  const projects = projectFilter(E2E_PROJECTS.filter(project => OUTPUT_REGRESSION_PROJECT_NAMES.has(project.name)))

  it.each(projects)('$name preserves page custom variables and t-class @source output', async (project) => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    await clearProjectBuildState(root)
    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await readProjectCss(projectPath, getProjectCssFiles(project))
    for (const variable of ISSUE_978_VARIABLES) {
      expect(css, `${project.name} should preserve issue 978 variable ${variable}`).toContain(variable)
    }
    for (const token of ISSUE_977_OUTPUT_TOKENS) {
      expect(css, `${project.name} should generate issue 977 t-class token ${token}`).toContain(token)
    }
  })
})
