import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('uni-app-webpack-tailwindcss-v4'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
