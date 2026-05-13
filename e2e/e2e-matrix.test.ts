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

  it('keeps the static e2e project matrix explicit', () => {
    expect(getAllStaticE2EProjectNames()).toEqual([
      'gulp-tailwindcss-v3',
      'gulp-tailwindcss-v4',
      'mpx-tailwindcss-v3',
      'mpx-tailwindcss-v4',
      'taro-webpack-tailwindcss-v3',
      'taro-webpack-tailwindcss-v4',
      'taro-vite-tailwindcss-v3',
      'taro-vite-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v3',
      'uni-app-vite-tailwindcss-v4',
      'weapp-vite-tailwindcss-v3',
      'weapp-vite-tailwindcss-v4',
    ])
  })
})
