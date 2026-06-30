import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('taro-webpack-vue3-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

describe('e2e', () => {
  it('keeps Tailwind CSS v4 css entries isolated and only emits mini-program preflight reset in app wxss', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const appCss = await fs.readFile(path.resolve(projectPath, 'dist/app.wxss'), 'utf8')
    const subNormalCss = await fs.readFile(path.resolve(projectPath, 'dist/sub-normal/pages/index.wxss'), 'utf8')
    const subIndependentCss = await fs.readFile(path.resolve(projectPath, 'dist/sub-independent/pages/index.wxss'), 'utf8')

    const normalizedAppCss = compactCss(appCss)
    expect(normalizedAppCss).toContain('view,text,::after,::before')
    expect(normalizedAppCss).toContain('box-sizing:border-box')
    expect(normalizedAppCss).toContain('margin:0')
    expect(normalizedAppCss).toContain('padding:0')
    expect(normalizedAppCss).toContain('border:0solid')
    expect(compactCss(subNormalCss)).not.toContain('view,text,::after,::before')
    expect(compactCss(subIndependentCss)).not.toContain('view,text,::after,::before')
    expect(subNormalCss).toContain('.bg-normal-subpackage-marker')
    expect(subNormalCss).not.toContain('.bg-independent-subpackage-marker')
    expect(subIndependentCss).toContain('.bg-independent-subpackage-marker')
    expect(subIndependentCss).not.toContain('.bg-normal-subpackage-marker')
  })

  it('does not emit Tailwind CSS v4 empty content init for v4 output', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await fs.readFile(
      path.resolve(projectPath, 'dist/app.wxss'),
      'utf8',
    )

    expect(css).not.toMatch(
      /^::before,\s*::after\s*\{\s*--tw-content:\s*(?:''|"")\s*(?:;|\})/m,
    )
  })
})
