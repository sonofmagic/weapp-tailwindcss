import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('taro-vite-vue3-tailwindcss-v3'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
