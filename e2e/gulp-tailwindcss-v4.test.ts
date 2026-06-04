import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('gulp-tailwindcss-v4'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
