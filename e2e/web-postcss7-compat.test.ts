import { getNativeProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getNativeProject('web-postcss7-compat'), {
  suite: 'native',
  fixturesDir: '../apps',
  describeTitle: 'e2e native',
  allowExtractionFailure: true,
})
