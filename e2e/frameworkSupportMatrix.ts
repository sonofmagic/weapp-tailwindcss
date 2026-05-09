import type { ProjectEntry } from './shared'
import process from 'node:process'
import { E2E_PROJECTS, NATIVE_PROJECTS } from './projectEntries'

type FixturesDir = '../demo' | '../apps'
type SupportTier = 'required' | 'exempt'

export interface FrameworkSupportCase {
  name: string
  framework: string
  builder: string
  tailwindcss: 'v3' | 'v4' | 'v5'
  fixturesDir: FixturesDir
  project: ProjectEntry
  snapshotProjectName?: string
  ci: {
    tier: SupportTier
    reason?: string
  }
  ide: {
    tier: SupportTier
    reason?: string
  }
}

function e2eProject(name: string) {
  const project = E2E_PROJECTS.find(item => item.name === name)
  if (!project) {
    throw new Error(`Unknown demo e2e project: ${name}`)
  }
  return project
}

function nativeProject(name: string) {
  const project = NATIVE_PROJECTS.find(item => item.name === name)
  if (!project) {
    throw new Error(`Unknown apps e2e project: ${name}`)
  }
  return project
}

function appProject(project: ProjectEntry) {
  return project
}

function supportCase(options: FrameworkSupportCase): FrameworkSupportCase {
  return options
}

export const FRAMEWORK_SUPPORT_CASES = [
  supportCase({
    name: 'uni-app-vue3-vite-tailwindcss-v3',
    framework: 'uni-app',
    builder: 'vite',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('uni-app-vue3-vite'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'uni-app-vite-tailwindcss-v4',
    framework: 'uni-app',
    builder: 'vite',
    tailwindcss: 'v4',
    fixturesDir: '../demo',
    project: e2eProject('uni-app-tailwindcss-v4'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'uni-app-vite-tailwindcss-v5',
    framework: 'uni-app',
    builder: 'vite',
    tailwindcss: 'v5',
    fixturesDir: '../demo',
    project: e2eProject('uni-app-tailwindcss-v5'),
    ci: { tier: 'required' },
    ide: {
      tier: 'exempt',
      reason: '当前静态快照覆盖 v5 生成器输出，微信开发者工具自动化暂不稳定。',
    },
  }),
  supportCase({
    name: 'taro-react-webpack-tailwindcss-v3',
    framework: 'taro',
    builder: 'webpack5',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('taro-app'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'taro-react-webpack-tailwindcss-v4',
    framework: 'taro',
    builder: 'webpack5',
    tailwindcss: 'v4',
    fixturesDir: '../demo',
    project: e2eProject('taro-webpack-tailwindcss-v4'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'taro-react-vite-tailwindcss-v3',
    framework: 'taro',
    builder: 'vite',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('taro-app-vite'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'taro-react-vite-tailwindcss-v4',
    framework: 'taro',
    builder: 'vite',
    tailwindcss: 'v4',
    fixturesDir: '../demo',
    project: e2eProject('taro-vite-tailwindcss-v4'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'taro-react-vite-tailwindcss-v5',
    framework: 'taro',
    builder: 'vite',
    tailwindcss: 'v5',
    fixturesDir: '../demo',
    project: e2eProject('taro-vite-tailwindcss-v5'),
    ci: { tier: 'required' },
    ide: {
      tier: 'exempt',
      reason: '当前静态快照覆盖 v5 生成器输出，微信开发者工具自动化暂不稳定。',
    },
  }),
  supportCase({
    name: 'taro-vue3-webpack-tailwindcss-v3',
    framework: 'taro',
    builder: 'webpack5',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('taro-vue3-app'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'taro-apps-webpack-tailwindcss-v4',
    framework: 'taro',
    builder: 'webpack5',
    tailwindcss: 'v4',
    fixturesDir: '../apps',
    project: appProject({
      name: 'taro-webpack-tailwindcss-v4',
      projectPath: 'taro-webpack-tailwindcss-v4',
      cssFile: 'dist/app.wxss',
    }),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'mpx-webpack-tailwindcss-v3',
    framework: 'mpx',
    builder: 'webpack5',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('mpx-app'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'mpx-webpack-tailwindcss-v4',
    framework: 'mpx',
    builder: 'webpack5',
    tailwindcss: 'v4',
    fixturesDir: '../demo',
    project: e2eProject('mpx-tailwindcss-v4'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'mpx-webpack-tailwindcss-v5',
    framework: 'mpx',
    builder: 'webpack5',
    tailwindcss: 'v5',
    fixturesDir: '../demo',
    project: e2eProject('mpx-tailwindcss-v5'),
    ci: { tier: 'required' },
    ide: {
      tier: 'exempt',
      reason: '当前静态快照覆盖 v5 生成器输出，微信开发者工具自动化暂不稳定。',
    },
  }),
  supportCase({
    name: 'gulp-tailwindcss-v3',
    framework: 'native',
    builder: 'gulp',
    tailwindcss: 'v3',
    fixturesDir: '../demo',
    project: e2eProject('gulp-app'),
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'weapp-vite-native-tailwindcss-v3',
    framework: 'native',
    builder: 'weapp-vite',
    tailwindcss: 'v3',
    fixturesDir: '../apps',
    project: nativeProject('vite-native'),
    snapshotProjectName: 'native-mina',
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'weapp-vite-native-ts-tailwindcss-v3',
    framework: 'native',
    builder: 'weapp-vite',
    tailwindcss: 'v3',
    fixturesDir: '../apps',
    project: nativeProject('vite-native-ts'),
    snapshotProjectName: 'native-mina',
    ci: { tier: 'required' },
    ide: { tier: 'required' },
  }),
  supportCase({
    name: 'postcss7-web-compat-tailwindcss-v3',
    framework: 'web',
    builder: 'postcss7',
    tailwindcss: 'v3',
    fixturesDir: '../apps',
    project: nativeProject('web-postcss7-compat'),
    ci: {
      tier: 'exempt',
      reason: 'Web PostCSS 7 兼容用例不是小程序框架产物，已有独立 e2e 测试文件覆盖。',
    },
    ide: {
      tier: 'exempt',
      reason: 'Web PostCSS 兼容用例不生成微信小程序 project.config.json。',
    },
  }),
] as const satisfies FrameworkSupportCase[]

export function getFrameworkCiCases() {
  return filterFrameworkCases(FRAMEWORK_SUPPORT_CASES.filter(item => item.ci.tier === 'required'))
}

export function getFrameworkIdeCases() {
  return filterFrameworkCases(FRAMEWORK_SUPPORT_CASES.filter(item => item.ide.tier === 'required'))
}

export function getFrameworkIdeExemptCases() {
  return filterFrameworkCases(FRAMEWORK_SUPPORT_CASES.filter(item => item.ide.tier === 'exempt'))
}

function filterFrameworkCases<T extends FrameworkSupportCase>(cases: readonly T[]): T[] {
  const filter = process.env['E2E_PROJECT_FILTER']
  if (!filter) {
    return [...cases]
  }

  const pattern = new RegExp(filter)
  return cases.filter(item => pattern.test(item.name) || pattern.test(item.project.name))
}
