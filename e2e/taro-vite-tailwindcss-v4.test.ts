import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('taro-vite-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

describe('e2e', () => {
  it('removes Tailwind CSS v4 bg-linear-to-r lab supports guard', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await fs.readFile(path.resolve(projectPath, 'dist/app-origin.wxss'), 'utf8')

    expect(css).toContain('.bg-linear-to-r')
    expect(css).toMatch(/--tw-gradient-position:\s*to right\s*(?:;\s*)?\}/)
    expect(css).toMatch(/background-image:\s*linear-gradient\(var\(--tw-gradient-stops\)\)\s*(?:;\s*)?\}/)
    expect(css).not.toContain('@supports (background-image: linear-gradient(in lab, red, red))')
    expect(css).not.toContain('in oklab')
  })
})
