import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('rax-app'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
