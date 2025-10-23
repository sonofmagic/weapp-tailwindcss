import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('uni-app-vue3-vite'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
