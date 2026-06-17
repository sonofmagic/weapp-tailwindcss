import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { getE2EProject } from './projectEntries'
import { defineProjectTest, ensureProjectBuilt } from './projectTest'

const project = getE2EProject('taro-vite-react-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

describe('e2e', () => {
  it('keeps non-class JSX and WXML text unescaped in Taro Vite React v4 output', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const pageJs = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/index.js'), 'utf8')
    const pageWxml = await fs.readFile(path.resolve(projectPath, 'dist/pages/index/index.wxml'), 'utf8')

    expect(pageJs).toContain('Hello world!')
    expect(pageJs).toContain('at App.vue:4 index.ts:120:3')
    expect(pageJs).toContain('size > 4 ? keep-[business] : App.vue:4')
    expect(pageJs).toContain('before content ["not-generated"]')
    expect(pageJs).toContain('https://example.com/a[b]?q=Hello world!')
    expect(pageJs).not.toContain('Hello world_e')
    expect(pageWxml).not.toContain('Hello world_e')
    expect(pageJs).not.toContain('App_dvue_c4')
    expect(pageJs).not.toContain('index_dts_c120_c3')
    expect(pageJs).not.toContain('keep-_bbusiness_B')
    expect(pageJs).not.toContain('not-generated_q_B')
  })

  it('keeps Tailwind CSS v4 bg-linear-to-r variable gradient without lab supports guard', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await fs.readFile(path.resolve(projectPath, 'dist/app-origin.wxss'), 'utf8')
    const linearBlocks = css.match(/\.bg-linear-to-r\s*\{[^}]*\}/g)?.join('\n') ?? ''

    expect(css).toContain('.bg-linear-to-r')
    expect(css).not.toMatch(/^::before,\s*::after\s*\{\s*--tw-content:\s*(?:''|"")\s*(?:;|\})/m)
    expect(css).toMatch(/--tw-gradient-position:\s*to right\s*;/)
    expect(css).toMatch(/background-image:\s*linear-gradient\(var\(--tw-gradient-stops\)\)/)
    expect(css).not.toContain('@supports (background-image: linear-gradient(in lab, red, red))')
    expect(linearBlocks).not.toContain('in oklab')
  })
})
