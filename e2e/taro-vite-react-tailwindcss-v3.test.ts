import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('taro-vite-react-tailwindcss-v3')
const allowedWorkspaceSourceDts = new Set([
  'packages/postcss/src/global.d.ts',
])
const workspaceSourceDtsRoots = [
  'packages/logger/src',
  'packages/postcss/src',
  'packages/reset/src',
  'packages/shared/src',
]

async function collectWorkspaceSourceDts(root: string, current: string): Promise<string[]> {
  let entries: Array<{ name: string, isDirectory: () => boolean, isFile: () => boolean }>
  try {
    entries = await fs.readdir(current, { withFileTypes: true })
  }
  catch {
    return []
  }

  const files: string[] = []
  for (const entry of entries) {
    const filepath = path.resolve(current, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectWorkspaceSourceDts(root, filepath))
    }
    else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      files.push(path.relative(root, filepath).split(path.sep).join('/'))
    }
  }
  return files
}

async function expectNoGeneratedWorkspaceSourceDts() {
  const repoRoot = path.resolve(__dirname, '..')
  const files = (
    await Promise.all(workspaceSourceDtsRoots.map(dir => collectWorkspaceSourceDts(repoRoot, path.resolve(repoRoot, dir))))
  ).flat()
  const generated = files.filter(file => !allowedWorkspaceSourceDts.has(file))

  expect(generated).toEqual([])
}

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

describe('e2e', () => {
  it('keeps non-class JSX text unescaped in Taro Vite React v3 output', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const pageJs = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/index.js'), 'utf8')
    const pageWxml = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/index.wxml'), 'utf8')
    const testPageJs = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/test.js'), 'utf8')
    const testPageWxml = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/test.wxml'), 'utf8')
    const appWxss = await fs.readFile(path.resolve(projectPath, 'dist/app.wxss'), 'utf8')

    expect(pageJs).toContain('Hello world!')
    expect(testPageJs).toContain('at App.vue:4 index.ts:120:3')
    expect(testPageJs).toContain('size > 4 ? keep-[business] : App.vue:4')
    expect(testPageJs).toContain('before content ["not-generated"]')
    expect(testPageJs).toContain('https://example.com/a[b]?q=Hello world!')
    expect(pageJs).not.toContain('Hello world_e')
    expect(pageWxml).not.toContain('Hello world_e')
    expect(testPageJs).not.toContain('App_dvue_c4')
    expect(testPageJs).not.toContain('index_dts_c120_c3')
    expect(testPageJs).not.toContain('keep-_bbusiness_B')
    expect(testPageJs).not.toContain('not-generated_q_B')
    expect(testPageWxml).not.toContain('Hello world_e')
    expect(appWxss).not.toContain('Hello world_e')
    expect(appWxss).not.toContain('keep-_bbusiness_B')
    expect(appWxss).not.toContain('before_ccontent-_b_qnot-generated_q_B')
  })

  it('does not generate workspace dependency dts files in source directories during Taro Vite React v3 build', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    await expectNoGeneratedWorkspaceSourceDts()
  })
})
