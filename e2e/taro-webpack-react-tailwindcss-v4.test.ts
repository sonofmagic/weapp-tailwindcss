import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('taro-webpack-react-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

describe('e2e', () => {
  it('keeps Tailwind CSS v4 mini-program preflight reset in app wxss', async () => {
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

    const normalizedCss = compactCss(css)
    expect(normalizedCss).toContain('view,text,::after,::before')
    expect(normalizedCss).toContain('box-sizing:border-box')
    expect(normalizedCss).toContain('margin:0')
    expect(normalizedCss).toContain('padding:0')
    expect(normalizedCss).toContain('border:0solid')
  })

  it('does not emit Tailwind CSS v3 empty content init for v4 output', async () => {
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

  it('keeps NutUI css imported from app entry in page wxss', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await fs.readFile(
      path.resolve(projectPath, 'dist/pages/index/index.wxss'),
      'utf8',
    )

    expect(css).toContain('.nut-icon')
    const normalizedCss = compactCss(css)
    expect(normalizedCss).toContain('view,text,::after,::before')
    expect(normalizedCss).toContain('box-sizing:border-box')
    expect(normalizedCss).toContain('margin:0')
    expect(normalizedCss).toContain('padding:0')
    expect(normalizedCss).toContain('border:0solid')
    expect(css).toContain('--nut-icon-height')
    expect(css).toContain('--nut-icon-width')
    expect(css).toContain('--nut-icon-line-height')
    expect(css).toContain('--nut-icon-color')
    expect(css).toContain('--animate-duration')
    expect(css).toContain('--animate-delay')
    expect(css).toContain('.nut-icon-loading')
    expect(css).toContain('@keyframes rotation')
    expect(css).toContain('@keyframes nutJump')
    expect(css).toContain('@keyframes nutShake')
    expect(css).not.toContain('does-not-exist')
  })
})
