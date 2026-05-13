import { getE2EProject } from './projectEntries'
import { defineProjectTest } from './projectTest'

defineProjectTest(getE2EProject('taro-webpack-react-tailwindcss-v3'), {
  suite: 'e2e',
  fixturesDir: '../demo',
})
