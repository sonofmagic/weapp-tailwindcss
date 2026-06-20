import fs from 'node:fs/promises'
import process from 'node:process'
import fg from 'fast-glob'
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

    const wxssFiles = await fg('dist/**/*.wxss', {
      cwd: projectPath,
      absolute: true,
      onlyFiles: true,
    })
    const wxss = (await Promise.all(wxssFiles.map(file => fs.readFile(file, 'utf8')))).join('\n')

    expect(wxss).toContain('.bg-gradient-to-r')
    expect(wxss).toContain('.bg-gradient-to-tr')
    expect(wxss).toContain('.from-cyan-500')
    expect(wxss).toContain('.via-purple-500')
    expect(wxss).toContain('.to-blue-500')
    expect(wxss).toMatch(/background-image:\s*linear-gradient\(to right,\s*var\(--tw-gradient-stops\)\)/)
    expect(wxss).toMatch(/--tw-gradient-stops:\s*var\(--tw-gradient-from\),\s*var\(--tw-gradient-to\)/)
    expect(wxss).toMatch(/--tw-gradient-stops:\s*var\(--tw-gradient-from\),\s*#a855f7 var\(--tw-gradient-via-position(?:,\s*)?\),\s*var\(--tw-gradient-to\)/)
    expect(wxss).toContain('--tw-gradient-from-position')
    expect(wxss).toContain('--tw-gradient-to-position')
    expect(wxss).toMatch(/background-image:\s*linear-gradient\(to right,#06b6d4,#3b82f6\)/)
    expect(wxss).toMatch(/background-image:\s*radial-gradient\(circle at 50% 50%,#06b6d4,#a855f7,#3b82f6\)/)
    expect(wxss).toMatch(/background-image:\s*conic-gradient\(from 180deg,#06b6d4,#a855f7,#3b82f6\)/)
  })
})
