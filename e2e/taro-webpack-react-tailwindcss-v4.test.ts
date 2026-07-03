import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'
import { defineTaroBareSelectorRegression } from './taroBareSelectorRegression'

const project = getE2EProject('taro-webpack-react-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

function countCssSelector(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return css.match(new RegExp(escaped, 'g'))?.length ?? 0
}

function expectMiniProgramPreflight(css: string) {
  const normalizedCss = compactCss(css)
  expect(normalizedCss).toContain('view,text,::after,::before')
  expect(normalizedCss).toContain('box-sizing:border-box')
  expect(normalizedCss).toContain('margin:0')
  expect(normalizedCss).toContain('padding:0')
  expect(normalizedCss).toContain('border:0solid')
}

async function findCssByMarker(projectPath: string, marker: string) {
  for (const cssFile of project.cssFiles ?? [project.cssFile]) {
    const css = await fs.readFile(path.resolve(projectPath, cssFile), 'utf8')
    if (css.includes(marker)) {
      return css
    }
  }
  return undefined
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

    expectMiniProgramPreflight(css)
  })

  it('keeps Tailwind CSS v4 mini-program preflight reset in CSS entries that import full Tailwind', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const normalCss = await findCssByMarker(projectPath, 'normal_subpackage_taro-webpack-react-tailwindcss-v4')
    expect(normalCss, 'normal full Tailwind CSS entry output should contain its own marker').toBeTruthy()
    expectMiniProgramPreflight(normalCss!)

    const independentCss = await findCssByMarker(projectPath, 'independent_subpackage_taro-webpack-react-tailwindcss-v4')
    expect(independentCss, 'independent full Tailwind CSS entry output should contain its own marker').toBeTruthy()
    expectMiniProgramPreflight(independentCss!)
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

  it('keeps sibling app css imports while avoiding duplicate generated source css', async () => {
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

    expect(countCssSelector(css, '.issue-940-style-class')).toBe(1)
    expect(countCssSelector(css, '.issue-940-app-class')).toBe(1)
  })

  defineTaroBareSelectorRegression(project)

  it('keeps webpack processed static asset urls in app wxss', async () => {
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

    expect(css).toContain('.issue-941-bg-image')
    expect(css).toMatch(/background-image:\s*url\(["']?data:image\/svg\+xml[;,]/)
    expect(css).not.toContain('./issue-941-asset.svg')
  })

  it('keeps page wxss isolated from app entry preflight when styleInjector is disabled', async () => {
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
    expect(normalizedCss).not.toContain('view,text,::after,::before')
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
