import { describe, expect, it } from 'vitest'
import {
  getAllStaticE2EProjectNames,
  HOT_UPDATE_COVERED_PROJECTS,
  HOT_UPDATE_EXEMPT_PROJECTS,
} from './e2eMatrix'

describe('e2e matrix', () => {
  it('covers every static e2e project with hot-update or an explicit exemption', () => {
    const uncovered = getAllStaticE2EProjectNames().filter((name) => {
      return !HOT_UPDATE_COVERED_PROJECTS.has(name) && !HOT_UPDATE_EXEMPT_PROJECTS.has(name)
    })

    expect(uncovered).toEqual([])
  })
})
