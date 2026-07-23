import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { buildCases, demoWatchShardCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { E2E_PROJECTS } from './projectEntries'
import { taroWebHmrCases } from './taro-web-demo-hmr-cases'

type PlatformTarget = 'h5' | 'mp'

interface FrameworkDemoExpectation {
  name: string
  framework: 'mpx' | 'taro' | 'uni-app' | 'weapp-vite'
  platforms: PlatformTarget[]
  notApplicablePlatforms?: PlatformTarget[]
  mpBuildScripts: string[]
  mpDevScripts: string[]
  h5BuildScripts?: string[]
  h5DevScripts?: string[]
}

const repoRoot = path.resolve(__dirname, '..')
const coreTaroDemos = [
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
] as const

const frameworkDemos: FrameworkDemoExpectation[] = [
  ...coreTaroDemos.map(name => ({
    name,
    framework: 'taro' as const,
    platforms: ['mp', 'h5'] as PlatformTarget[],
    mpBuildScripts: ['build:weapp'],
    mpDevScripts: ['dev:weapp'],
    h5BuildScripts: ['build:h5'],
    h5DevScripts: ['dev:h5'],
  })),
  {
    name: 'mpx-tailwindcss-v4',
    framework: 'mpx',
    platforms: ['mp'],
    notApplicablePlatforms: ['h5'],
    mpBuildScripts: ['build'],
    mpDevScripts: ['dev', 'dev:e2e-watch'],
  },
  {
    name: 'uni-app-vite-tailwindcss-v4',
    framework: 'uni-app',
    platforms: ['mp', 'h5'],
    mpBuildScripts: ['build:mp-weixin'],
    mpDevScripts: ['dev:mp-weixin', 'dev:e2e-watch'],
    h5BuildScripts: ['build:h5'],
    h5DevScripts: ['dev:h5'],
  },
  {
    name: 'weapp-vite-tailwindcss-v4',
    framework: 'weapp-vite',
    platforms: ['mp'],
    notApplicablePlatforms: ['h5'],
    mpBuildScripts: ['build'],
    mpDevScripts: ['dev', 'dev:e2e-watch'],
  },
]

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as { scripts?: Record<string, string> }
}

function packageJson(name: string) {
  return readJson(path.join(repoRoot, 'demo', name, 'package.json'))
}

function rootScripts() {
  return readJson(path.join(repoRoot, 'package.json')).scripts ?? {}
}

function expectScriptsExist(name: string, scripts: string[]) {
  const packageScripts = packageJson(name).scripts ?? {}
  for (const script of scripts) {
    expect(packageScripts[script], `${name} should expose ${script}`).toBeDefined()
  }
}

describe('framework demo CI coverage matrix', () => {
  it('declares framework demos and unsupported platform boundaries explicitly', () => {
    expect(frameworkDemos.map(item => item.name).sort()).toEqual([
      ...coreTaroDemos,
      'mpx-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
    ].sort())

    for (const item of frameworkDemos) {
      expect(item.platforms, `${item.name} should cover at least one platform`).toContain('mp')
      if (item.notApplicablePlatforms?.includes('h5')) {
        expect(item.h5BuildScripts, `${item.name} should not pretend to have H5 build coverage`).toBeUndefined()
        expect(item.h5DevScripts, `${item.name} should not pretend to have H5 dev coverage`).toBeUndefined()
      }
      else {
        expect(item.platforms, `${item.name} should cover H5`).toContain('h5')
        expect(item.h5BuildScripts?.length, `${item.name} should declare H5 build scripts`).toBeGreaterThan(0)
        expect(item.h5DevScripts?.length, `${item.name} should declare H5 dev scripts`).toBeGreaterThan(0)
      }
    }
  })

  it('requires every framework demo package to expose real user build/dev scripts', () => {
    for (const item of frameworkDemos) {
      expectScriptsExist(item.name, item.mpBuildScripts)
      expectScriptsExist(item.name, item.mpDevScripts)
      expectScriptsExist(item.name, item.h5BuildScripts ?? [])
      expectScriptsExist(item.name, item.h5DevScripts ?? [])
    }
  })

  it('wires framework scripts to CI-readable mini-program and H5 suites', () => {
    const scripts = rootScripts()
    const uniAppV4Config = fs.readFileSync(path.join(repoRoot, 'demo/uni-app-vite-tailwindcss-v4/vite.config.ts'), 'utf8')
    expect(scripts['e2e:static']).toContain('WEAPP_TW_ISSUE_1005_FINAL_CSS_FIXTURE=1')
    expect(scripts['e2e:static:u']).toContain('WEAPP_TW_ISSUE_1005_FINAL_CSS_FIXTURE=1')
    expect(uniAppV4Config).not.toContain('process.env.E2E_SKIP_OPEN_AUTOMATOR')
    expect(scripts['e2e:frameworks']).toBe('pnpm e2e:frameworks:mp && pnpm e2e:frameworks:h5')
    expect(scripts['e2e:frameworks:matrix']).toContain('framework-demo-ci-coverage-matrix.test.ts')
    expect(scripts['e2e:frameworks:matrix']).toContain('taro-ci-coverage-matrix.test.ts')
    expect(scripts['e2e:frameworks:mp']).toBe('pnpm e2e:taro:mp && pnpm e2e:mpx && pnpm e2e:uni:mp && pnpm e2e:weapp-vite')
    expect(scripts['e2e:frameworks:h5']).toBe('pnpm e2e:taro:h5 && pnpm e2e:uni:h5')
    expect(scripts['e2e:mpx']).toContain('E2E_PROJECT_FILTER="^mpx-tailwindcss-v4$"')
    expect(scripts['e2e:mpx']).toContain('E2E_WATCH_MAX_PLUGIN_PROCESS_MS=8000')
    expect(scripts['e2e:mpx']).toContain('E2E_WATCH_CASE=mpx-tailwindcss-v4')
    expect(scripts['e2e:uni']).toBe('pnpm e2e:uni:mp && pnpm e2e:uni:h5')
    expect(scripts['e2e:uni:mp']).toContain('E2E_PROJECT_FILTER="^uni-app-vite-tailwindcss-v4$"')
    expect(scripts['e2e:uni:mp']).toContain('E2E_WATCH_MAX_PLUGIN_PROCESS_MS=8000')
    expect(scripts['e2e:uni:mp']).toContain('E2E_WATCH_CASE=uni-app-vite-tailwindcss-v4')
    expect(scripts['e2e:uni:h5']).toContain('run build:h5')
    expect(scripts['e2e:uni:h5']).toContain('e2e:uni:h5-dev')
    expect(scripts['e2e:uni:h5-dev']).toContain('uni-app-vite-tailwindcss-dev-h5.test.ts')
    expect(scripts['e2e:weapp-vite']).toContain('E2E_PROJECT_FILTER="^weapp-vite-tailwindcss-v4$"')
    expect(scripts['e2e:weapp-vite']).toContain('E2E_WATCH_MAX_PLUGIN_PROCESS_MS=8000')
    expect(scripts['e2e:weapp-vite']).toContain('E2E_WATCH_CASE=weapp-vite-tailwindcss-v4')
  })

  it('wires every framework demo to static mini-program e2e and watch-HMR evidence', () => {
    const staticProjectNames = new Set(E2E_PROJECTS.map(item => item.name))
    const watchCases = buildCases(repoRoot)
      .filter(item => item.group === 'demo')
      .map(item => item.name)
    const watchCaseNames = new Set(watchCases)

    for (const item of frameworkDemos) {
      expect(staticProjectNames.has(item.name), `${item.name} should have static mini-program e2e`).toBe(true)
      expect(watchCaseNames.has(item.name), `${item.name} should have watch-HMR e2e`).toBe(true)
      expect(fs.existsSync(path.join(repoRoot, `e2e/watch/hot-update/demo/${item.name}.test.ts`)), `${item.name} should have a watch-HMR test file`).toBe(true)
    }

    expect(demoWatchShardCases['demo-taro-react']).toEqual([
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
    ])
    expect(demoWatchShardCases['demo-taro-vue3']).toEqual([
      'taro-vite-vue3-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v4',
    ])
    expect(demoWatchShardCases['demo-uni']).toEqual(['uni-app-vite-tailwindcss-v4'])
    expect(Object.keys(demoWatchShardCases)).not.toContain('demo')
  })

  it('wires H5-capable frameworks to browser/dev H5 evidence', () => {
    const h5Capable = frameworkDemos.filter(item => item.platforms.includes('h5'))
    const taroH5Projects = new Set(taroWebHmrCases.map(item => item.projectDir.replace('demo/', '')))
    const uniH5DevTest = fs.readFileSync(path.join(repoRoot, 'e2e/uni-app-vite-tailwindcss-dev-h5.test.ts'), 'utf8')

    expect(h5Capable.map(item => item.name).sort()).toEqual([
      ...coreTaroDemos,
      'uni-app-vite-tailwindcss-v4',
    ].sort())

    for (const name of coreTaroDemos) {
      expect(taroH5Projects.has(name), `${name} should have browser H5 HMR e2e`).toBe(true)
    }
    expect(uniH5DevTest).toContain('uni-app-vite-tailwindcss-v4')
    expect(uniH5DevTest).toContain('/src/main.css?direct')
    expect(uniH5DevTest).toContain('/src/App.vue?vue&type=style&index=0&lang.scss')
  })
})
