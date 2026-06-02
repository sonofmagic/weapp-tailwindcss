import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { replaceWxml } from '../packages/weapp-tailwindcss/src/wxml'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('weapp-vite-tailwindcss-v3')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
  allowExtractionFailure: true,
})

describe('e2e', () => {
  it('keeps non-class WXML expression strings unescaped in weapp-vite v3 output', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const pageWxml = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/index.wxml'), 'utf8')

    expect(pageWxml).toContain(replaceWxml('bg-[red]'))
    expect(pageWxml).toContain('Hello world!')
    expect(pageWxml).toContain('keep-[business]')
    expect(pageWxml).toContain('at App.vue:4')
    expect(pageWxml).not.toContain('Hello world_e')
    expect(pageWxml).not.toContain('keep-_bbusiness_B')
    expect(pageWxml).not.toContain('App_dvue_c4')
  })
})
