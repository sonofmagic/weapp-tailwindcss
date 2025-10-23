import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('native-mina'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
