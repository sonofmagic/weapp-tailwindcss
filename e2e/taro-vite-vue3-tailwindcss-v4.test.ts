import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'
import { defineTaroBareSelectorRegression } from './taroBareSelectorRegression'

const project = getE2EProject('taro-vite-vue3-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

defineTaroBareSelectorRegression(project)
