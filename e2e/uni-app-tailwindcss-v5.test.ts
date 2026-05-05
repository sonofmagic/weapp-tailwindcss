import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('uni-app-tailwindcss-v5'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
