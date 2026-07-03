import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'
import { defineTaroBareSelectorRegression } from './taroBareSelectorRegression'

const project = getE2EProject('mpx-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})

defineTaroBareSelectorRegression(project)
