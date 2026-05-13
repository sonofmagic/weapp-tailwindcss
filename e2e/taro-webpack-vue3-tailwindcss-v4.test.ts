import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('taro-webpack-vue3-tailwindcss-v4'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
