import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import {
  getAllStaticE2EProjectNames,
  HOT_UPDATE_COVERED_PROJECTS,
  HOT_UPDATE_EXEMPT_PROJECTS,
} from './e2eMatrix'

const v5DemoProjects = [
  'uni-app-tailwindcss-v5',
  'taro-vite-tailwindcss-v5',
  'mpx-tailwindcss-v5',
]

describe('e2e matrix', () => {
  it('covers every static e2e project with hot-update or an explicit exemption', () => {
    const uncovered = getAllStaticE2EProjectNames().filter((name) => {
      return !HOT_UPDATE_COVERED_PROJECTS.has(name) && !HOT_UPDATE_EXEMPT_PROJECTS.has(name)
    })

    expect(uncovered).toEqual([])
  })

  it('keeps standalone v5 demo projects covered by static e2e snapshots', () => {
    const staticProjects = new Set(getAllStaticE2EProjectNames())

    for (const project of v5DemoProjects) {
      expect(staticProjects.has(project)).toBe(true)
      expect(fs.existsSync(path.resolve(__dirname, `${project}.test.ts`))).toBe(true)
      expect(fs.existsSync(path.resolve(__dirname, `__snapshots__/e2e/${project}/tw-class-list.json`))).toBe(true)
      expect(fs.existsSync(path.resolve(__dirname, `__snapshots__/e2e/${project}/app.wxss`))).toBe(true)
    }
  })
})
