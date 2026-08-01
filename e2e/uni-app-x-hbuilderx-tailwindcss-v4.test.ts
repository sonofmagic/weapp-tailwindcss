import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

const project = getE2EProject('uni-app-x-hbuilderx-tailwindcss-v4')

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})
