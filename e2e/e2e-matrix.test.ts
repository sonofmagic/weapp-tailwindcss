import { describe, expect, it } from 'vitest'
import {
  getAllStaticE2EProjectNames,
  HOT_UPDATE_COVERED_PROJECTS,
  HOT_UPDATE_EXEMPT_PROJECTS,
} from './e2eMatrix'
import { webViteHmrCaseNames } from './web-vite-demo-hmr-cases'

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
      'taro-webpack-react-tailwindcss-v3',
      'taro-webpack-react-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v3',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v3',
      'taro-webpack-vue3-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v3',
      'taro-vite-vue3-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v3',
      'uni-app-vite-tailwindcss-v4',
      'weapp-vite-tailwindcss-v3',
      'weapp-vite-tailwindcss-v4',
    ])
  })

  it('covers every demo/web Vite package with browser source HMR', () => {
    expect(webViteHmrCaseNames).toEqual([
      'web react vite Tailwind v3',
      'web react vite Tailwind v4',
      'web vue vite Tailwind v3',
      'web vue vite Tailwind v4',
    ])
  })
})
