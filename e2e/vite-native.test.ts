import { getNativeProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getNativeProject('vite-native'), {
  suite: 'native',
  fixturesDir: '../apps',
  describeTitle: 'e2e native',
  allowExtractionFailure: true,
})
