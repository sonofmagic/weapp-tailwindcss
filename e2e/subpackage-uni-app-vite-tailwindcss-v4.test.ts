import type { ProjectEntry } from './shared'
import { defineProjectTest } from './projectTest'

const project = {
  name: 'subpackage-uni-app-vite-tailwindcss-v4',
  projectPath: 'subpackage-uni-app-vite-tailwindcss-v4/dist/build/mp-weixin',
  cssFile: 'main.wxss',
  cssFiles: [
    'main.wxss',
    'sub-normal/index.wxss',
    'sub-normal/pages/index.wxss',
    'sub-independent/index.wxss',
    'sub-independent/pages/index.wxss',
  ],
} satisfies ProjectEntry

defineProjectTest(project, {
  suite: 'e2e',
  fixturesDir: '../demo',
})
