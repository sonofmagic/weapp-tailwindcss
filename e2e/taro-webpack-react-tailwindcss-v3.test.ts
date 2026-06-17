import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { ensureProjectBuilt } from './projectBuild'
import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

const project = getE2EProject('taro-webpack-react-tailwindcss-v3')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

describe('e2e', () => {
  it('keeps Tailwind CSS v3 gradient stop fallbacks parseable for issue 928', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const appWxss = await fs.readFile(path.resolve(projectPath, 'dist/app.wxss'), 'utf8')

    expect(appWxss).toContain('.bg-gradient-to-r')
    expect(appWxss).toContain('.bg-gradient-to-tr')
    expect(appWxss).toContain('.from-cyan-500')
    expect(appWxss).toContain('.via-purple-500')
    expect(appWxss).toContain('.to-blue-500')
    expect(appWxss).toMatch(/background-image:\s*linear-gradient\(to right,\s*var\(--tw-gradient-stops\)\)/)
    expect(appWxss).toContain('--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to)')
    expect(appWxss).toContain('--tw-gradient-stops: var(--tw-gradient-from), #a855f7 var(--tw-gradient-via-position), var(--tw-gradient-to)')
    expect(appWxss).toContain('var(--tw-gradient-from-position)')
    expect(appWxss).toContain('var(--tw-gradient-to-position)')
    expect(appWxss).toContain('background-image: linear-gradient(to right,#06b6d4,#3b82f6)')
    expect(appWxss).toContain('background-image: radial-gradient(circle at 50% 50%,#06b6d4,#a855f7,#3b82f6)')
    expect(appWxss).toContain('background-image: conic-gradient(from 180deg,#06b6d4,#a855f7,#3b82f6)')
  })
})
