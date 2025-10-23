import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('taro-app-vite'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
