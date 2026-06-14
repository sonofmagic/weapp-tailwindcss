import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import {
  DEMO_COVERAGE_MATRIX,
  discoverDemoPackageNames,
  getAutomatedHotUpdateDemoNames,
  getAutomatedThreeBlockHotUpdateDemoNames,
  getDefaultHotUpdateDemoNames,
} from './demoCoverageMatrix'
import {
  getAllStaticE2EProjectNames,
  HOT_UPDATE_COVERED_PROJECTS,
  HOT_UPDATE_EXEMPT_PROJECTS,
} from './e2eMatrix'
import { frameworkIdeWatchCaseNames } from './frameworkIdeHotUpdate'
import { getFrameworkIdeCases } from './frameworkSupportMatrix'
import { MULTIPLATFORM_TARGETS } from './multiplatform-build-output/targets'
import { E2E_PROJECTS } from './projectEntries'
import { taroWebHmrCaseNames } from './taro-web-demo-hmr-cases'
import { webViteHmrCaseNames } from './web-vite-demo-hmr-cases'

interface DemoPackageJson {
  scripts?: Record<string, string>
}

const DEMO_THEME_MODE_REQUIRED_TOKENS = [
  'theme-mode-demo',
  'system-dark:',
  'theme-dark',
]

function readDemoPackageJson(packageJson: string) {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', packageJson), 'utf8'),
  ) as DemoPackageJson
}

function scriptName(value: string) {
  return value.split(/\s+/, 1)[0] ?? value
}

function platformFromScriptName(name: string) {
  if (name === 'build' || name === 'dev') {
    return undefined
  }
  if (name === 'build:babel' || name === 'build:local' || name === 'build:debug-loader') {
    return undefined
  }
  if (name === 'build:e2e' || name === 'test:e2e') {
    return undefined
  }
  if (name === 'dev:debug' || name === 'dev:local' || name === 'dev:debug-loader' || name === 'dev:e2e-watch') {
    return undefined
  }
  if (name === 'dev:write') {
    return undefined
  }
  if (name === 'dev:0' || name === 'dev:1' || name === 'dev:open') {
    return undefined
  }
  if (name === 'build:custom' || name === 'dev:custom') {
    return undefined
  }
  if (name === 'build:weapp' || name === 'dev:weapp') {
    return 'weapp'
  }
  if (name === 'dev:android:emulator') {
    return 'app-android'
  }
  if (name === 'dev:ios:simulator') {
    return 'app-ios'
  }
  if (name.startsWith('build:')) {
    return name.slice('build:'.length)
  }
  if (name.startsWith('dev:')) {
    return name.slice('dev:'.length)
  }
}

function isPlatformCovered(platforms: Set<string>, platform: string) {
  if (platform === 'app') {
    return platforms.has('app') || (platforms.has('app-android') && platforms.has('app-ios'))
  }
  if (platform === 'android' || platform === 'ios') {
    return platforms.has(platform) || platforms.has('rn')
  }
  if (platform === 'harmony') {
    return platforms.has(platform) || platforms.has('harmony-hybrid')
  }
  return platforms.has(platform)
}

function collectDemoWeappTailwindcssConfigFiles() {
  const demoRoot = path.resolve(__dirname, '../demo')
  const files: string[] = []
  const ignoredDirs = new Set(['node_modules', 'dist', '.output', '.vite', '.turbo'])
  const configFileRE = /(?:^|\/)(?:vite\.config|_vite\.config|webpack\.config|gulpfile|config\/index)\.[cm]?[jt]s$/

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          walk(path.join(dir, entry.name))
        }
        continue
      }
      if (!entry.isFile()) {
        continue
      }
      const file = path.join(dir, entry.name)
      const relative = path.relative(demoRoot, file).split(path.sep).join('/')
      if (!configFileRE.test(relative)) {
        continue
      }
      const code = fs.readFileSync(file, 'utf8')
      if (code.includes('WeappTailwindcss')) {
        files.push(file)
      }
    }
  }

  walk(demoRoot)
  return files.sort()
}

function readDemoSource(entry: { name: string }) {
  const demoRoot = path.resolve(__dirname, '../demo', entry.name)
  const ignoredDirs = new Set(['node_modules', 'dist', 'unpackage', '.vite', '.turbo'])
  const sourceExts = new Set(['.css', '.js', '.jsx', '.mpx', '.scss', '.ts', '.tsx', '.uvue', '.vue', '.wxml'])
  const parts: string[] = []

  function walk(dir: string) {
    for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (dirent.isDirectory()) {
        if (!ignoredDirs.has(dirent.name)) {
          walk(path.join(dir, dirent.name))
        }
        continue
      }
      if (!dirent.isFile() || !sourceExts.has(path.extname(dirent.name))) {
        continue
      }
      parts.push(fs.readFileSync(path.join(dir, dirent.name), 'utf8'))
    }
  }

  walk(demoRoot)
  return parts.join('\n')
}

describe('e2e matrix', () => {
  it('keeps every demo package explicit in the demo coverage matrix', () => {
    expect(DEMO_COVERAGE_MATRIX.map(item => item.name).sort()).toEqual(discoverDemoPackageNames())
  })

  it('keeps every demo coverage entry backed by package.json and platform evidence', () => {
    for (const entry of DEMO_COVERAGE_MATRIX) {
      expect(entry.packageJson, `${entry.name} should point at its package.json`).toBe(`demo/${entry.name}/package.json`)
      expect(
        fs.existsSync(path.resolve(__dirname, '..', entry.packageJson)),
        `${entry.name} package.json should exist`,
      ).toBe(true)
      const pkg = readDemoPackageJson(entry.packageJson)
      expect(entry.platforms.length, `${entry.name} should declare at least one platform`).toBeGreaterThan(0)
      for (const platform of entry.platforms) {
        expect(platform.command.length, `${entry.name} ${platform.platform} should document a validation command`).toBeGreaterThan(0)
        expect(platform.evidence.length, `${entry.name} ${platform.platform} should document validation evidence`).toBeGreaterThan(0)
        if (platform.buildScript) {
          expect(
            pkg.scripts?.[scriptName(platform.buildScript)],
            `${entry.name} ${platform.platform} build script should exist`,
          ).toBeDefined()
        }
        if (platform.devScript) {
          expect(
            pkg.scripts?.[scriptName(platform.devScript)],
            `${entry.name} ${platform.platform} dev script should exist`,
          ).toBeDefined()
        }
        if (platform.staticCoverage !== 'automated' || platform.hmrCoverage !== 'automated') {
          expect(platform.reason?.length, `${entry.name} ${platform.platform} should explain local/exempt coverage`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('keeps every demo wired to system and manual dark mode examples', () => {
    for (const entry of DEMO_COVERAGE_MATRIX) {
      const source = readDemoSource(entry)
      for (const token of DEMO_THEME_MODE_REQUIRED_TOKENS) {
        expect(source, `${entry.name} should include ${token}`).toContain(token)
      }
      const manualDarkToken = entry.tailwindcss === 'v3' ? 'theme-dark:bg-zinc-950' : 'dark:bg-zinc-950'
      expect(source, `${entry.name} should include manual dark variant ${manualDarkToken}`).toContain(manualDarkToken)
    }
  })

  it('covers every platform-looking demo script in the demo coverage matrix', () => {
    for (const entry of DEMO_COVERAGE_MATRIX) {
      const pkg = readDemoPackageJson(entry.packageJson)
      const platforms = new Set(entry.platforms.map(item => item.platform))
      const missing = Object.keys(pkg.scripts ?? {})
        .map(platformFromScriptName)
        .filter((platform): platform is string => Boolean(platform))
        .filter(platform => !isPlatformCovered(platforms, platform))

      expect([...new Set(missing)].sort(), `${entry.name} should declare every package platform script`).toEqual([])
    }
  })

  it('declares template/script/style block coverage for SFC-like demos', () => {
    for (const entry of DEMO_COVERAGE_MATRIX.filter(item => item.sourceShape.includes('sfc') || item.sourceShape === 'uvue')) {
      expect(entry.sfcBlocks, `${entry.name} should declare template/script/style coverage`).toEqual(['template', 'script', 'style'])
    }
  })

  it('keeps demo WeappTailwindcss configs independent from explicit cssEntries', () => {
    for (const file of collectDemoWeappTailwindcssConfigFiles()) {
      const code = fs.readFileSync(file, 'utf8')
      expect(code, `${path.relative(path.resolve(__dirname, '..'), file)} should rely on automatic Tailwind v4 CSS entry discovery`).not.toContain('cssEntries')
    }
  })

  it('wires automated demo hot-update coverage to known watch cases', () => {
    expect(getAutomatedHotUpdateDemoNames()).toEqual(getDefaultHotUpdateDemoNames())
  })

  it('requires every mini-program demo to run IDE class HMR and visual HMR screenshots', () => {
    if (process.env['E2E_PROJECT_FILTER']) {
      return
    }

    const demoNames = DEMO_COVERAGE_MATRIX
      .filter(item => !item.name.startsWith('web/'))
      .map(item => item.name)
      .sort()
    const ideCaseNames = getFrameworkIdeCases().map(item => item.name).sort()
    const visualCaseNames = E2E_PROJECTS.map(item => item.name).sort()

    expect(ideCaseNames).toEqual(demoNames)
    expect(visualCaseNames).toEqual(demoNames)
    expect(Object.keys(frameworkIdeWatchCaseNames).sort()).toEqual(demoNames)

    for (const item of E2E_PROJECTS) {
      expect(item.skipOpenAutomator, `${item.name} should open in IDE visual HMR`).toBeUndefined()
    }
  })

  it('keeps every automated mini-program demo in the dynamic arbitrary-value CSS regression', () => {
    const regressionCaseNames = E2E_PROJECTS
      .filter(item => !item.name.includes('hbuilderx'))
      .map(item => item.name)
      .sort()
    const expectedNames = DEMO_COVERAGE_MATRIX
      .filter(item => item.platforms.some(platform => platform.staticCoverage === 'automated'))
      .filter(item => !item.hbuilderxLocal)
      .filter(item => !item.name.startsWith('web/'))
      .map(item => item.name)
      .sort()

    expect(regressionCaseNames).toEqual(expectedNames)
  })

  it('keeps IDE visual HMR in the demo workflow and full IDE command', () => {
    const rootPackageJson = readDemoPackageJson('package.json')
    const workflow = fs.readFileSync(path.resolve(__dirname, '../scripts/demo-e2e-workflow.ts'), 'utf8')
    const visualScript = fs.readFileSync(path.resolve(__dirname, '../scripts/demo-visual-e2e-report.ts'), 'utf8')

    expect(rootPackageJson.scripts?.['e2e:ide:visual']).toContain('--weapp-only --fail-on-incomplete')
    expect(rootPackageJson.scripts?.['e2e:ide:issue-909']).toContain('e2e/issue-909-ide.test.ts')
    expect(rootPackageJson.scripts?.['e2e:ide:issue-909:skip-build']).toContain('E2E_SKIP_BUILD=1')
    expect(rootPackageJson.scripts?.['e2e:ide:where']).toContain('e2e/where-selector-ide.test.ts')
    expect(rootPackageJson.scripts?.['e2e:ide:full']).toContain('pnpm e2e:ide && pnpm e2e:ide:issue-909 && pnpm e2e:ide:where && pnpm e2e:ide:visual')
    expect(visualScript).toContain('url: item.name.startsWith(\'mpx-\') ? \'/pages/index\' : \'/pages/index/index\'')
    expect(workflow).toContain('args: [\'e2e:mp:ide\']')
  })

  it('keeps demo workflow routed through composable platform e2e groups', () => {
    const rootPackageJson = readDemoPackageJson('package.json')
    const workflow = fs.readFileSync(path.resolve(__dirname, '../scripts/demo-e2e-workflow.ts'), 'utf8')
    const scripts = rootPackageJson.scripts ?? {}

    expect(scripts['e2e:mp']).toBe('pnpm e2e:static && pnpm e2e:hot-update:demo')
    expect(scripts['e2e:mp:ide']).toBe('pnpm e2e:ide:full')
    expect(scripts['e2e:h5']).toBe('pnpm e2e:taro:h5-build && pnpm e2e:taro:web-hmr && pnpm e2e:web:hmr')
    expect(scripts['e2e:app']).toBe('pnpm e2e:android && pnpm e2e:ios && pnpm e2e:harmony')
    expect(scripts['e2e:hbuilderx:local:harmony']).toContain('E2E_HBUILDERX_APP_PLATFORM=app-harmony')

    for (const scriptName of ['e2e:mp', 'e2e:h5', 'e2e:hbuilderx:mp', 'e2e:hbuilderx:h5', 'e2e:android', 'e2e:ios', 'e2e:harmony']) {
      expect(workflow).toContain(`args: ['${scriptName}']`)
    }
  })

  it('wires SFC-like automated hot-update demos to template/script/style report assertions', () => {
    expect(getAutomatedThreeBlockHotUpdateDemoNames()).toEqual([
      'mpx-tailwindcss-v3',
      'mpx-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v3',
      'taro-vite-vue3-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v3',
      'taro-webpack-vue3-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v3',
      'uni-app-vite-tailwindcss-v4',
    ])
  })

  it('wires web demo HMR matrix entries to browser HMR cases', () => {
    const expectedNames = DEMO_COVERAGE_MATRIX
      .filter(item => item.name.startsWith('web/'))
      .map(item => item.name.replace('web/', 'web ').replaceAll('-', ' '))
      .map(item => item.replace('tailwindcss v', 'Tailwind v'))

    expect(webViteHmrCaseNames).toEqual(expectedNames)
  })

  it('wires every Taro demo H5 platform to browser HMR cases', () => {
    const expectedNames = DEMO_COVERAGE_MATRIX
      .filter(item => item.framework === 'taro-react' || item.framework === 'taro-vue3')
      .map(item => item.name.replaceAll('-', ' '))
      .map(item => item.replace('tailwindcss v', 'Tailwind v'))

    expect(taroWebHmrCaseNames).toEqual(expectedNames)

    for (const entry of DEMO_COVERAGE_MATRIX.filter(item => item.framework === 'taro-react' || item.framework === 'taro-vue3')) {
      const weapp = entry.platforms.find(item => item.platform === 'weapp')
      const h5 = entry.platforms.find(item => item.platform === 'h5')
      expect(weapp?.hmrCoverage, `${entry.name} should automate mini-program HMR`).toBe('automated')
      expect(h5?.hmrCoverage, `${entry.name} should automate H5 browser HMR`).toBe('automated')
      expect(h5?.command, `${entry.name} H5 should run the Taro browser HMR suite`).toContain('e2e:taro:web-hmr')
    }
  })

  it('keeps uni-app and uni-app x demo workflow coverage explicit for mini-program, web, Android, iOS and Harmony', () => {
    const expectedPlatformsByName = new Map([
      ['uni-app-vite-tailwindcss-v3', ['mp-weixin', 'h5', 'app-android', 'app-ios']],
      ['uni-app-vite-tailwindcss-v4', ['mp-weixin', 'h5', 'app-android', 'app-ios']],
      ['uni-app-vite-vue3-hbuilderx-tailwindcss-v3', ['mp-weixin', 'h5', 'app-android', 'app-ios']],
      ['uni-app-vite-vue3-hbuilderx-tailwindcss-v4', ['mp-weixin', 'h5', 'app-android', 'app-ios']],
      ['uni-app-x-hbuilderx-tailwindcss-v3', ['mp-weixin', 'h5', 'app-android', 'app-ios', 'app-harmony']],
      ['uni-app-x-hbuilderx-tailwindcss-v4', ['mp-weixin', 'h5', 'app-android', 'app-ios', 'app-harmony']],
    ])

    for (const [name, platforms] of expectedPlatformsByName) {
      const entry = DEMO_COVERAGE_MATRIX.find(item => item.name === name)
      expect(entry, `${name} should exist in DEMO_COVERAGE_MATRIX`).toBeDefined()
      for (const platform of platforms) {
        const coverage = entry?.platforms.find(item => item.platform === platform)
        expect(coverage, `${name} should declare ${platform}`).toBeDefined()
        expect(coverage?.command.length, `${name} ${platform} should document workflow command`).toBeGreaterThan(0)
        if (platform === 'app-android' || platform === 'app-ios' || platform === 'app-harmony') {
          expect(coverage?.hmrCoverage, `${name} ${platform} should be local HBuilderX coverage`).toBe('local')
          expect(coverage?.evidence, `${name} ${platform} should point at HBuilderX evidence`).toContain('hbuilderx')
        }
      }
    }
  })

  it('wires local/default platform entries to the multiplatform target matrix', () => {
    const targets = new Set(MULTIPLATFORM_TARGETS.map(item => `${item.projectDir.replace('demo/', '')}:${item.platform}`))
    for (const entry of DEMO_COVERAGE_MATRIX.filter(item => ['mpx', 'taro-react', 'taro-vue3', 'uni-app', 'uni-app-x'].includes(item.framework))) {
      for (const platform of entry.platforms) {
        if (platform.staticCoverage === 'exempt' && platform.hmrCoverage === 'exempt') {
          continue
        }
        if (entry.name.includes('hbuilderx') && entry.framework === 'uni-app') {
          continue
        }
        if (entry.name.includes('hbuilderx') && entry.framework === 'uni-app-x' && platform.platform === 'h5') {
          continue
        }
        expect(targets.has(`${entry.name}:${platform.platform}`), `${entry.name} ${platform.platform} should be in MULTIPLATFORM_TARGETS`).toBe(true)
      }
    }
  })

  it('covers every static e2e project with hot-update or an explicit exemption', () => {
    const hotUpdateCoveredProjects = HOT_UPDATE_COVERED_PROJECTS as ReadonlySet<string>
    const hotUpdateExemptProjects = HOT_UPDATE_EXEMPT_PROJECTS as ReadonlySet<string>
    const uncovered = getAllStaticE2EProjectNames().filter((name) => {
      return !hotUpdateCoveredProjects.has(name) && !hotUpdateExemptProjects.has(name)
    })

    expect(uncovered).toEqual([])
  })

  it('keeps the static e2e project matrix explicit', () => {
    expect(getAllStaticE2EProjectNames()).toEqual([
      'gulp-tailwindcss-v3',
      'gulp-tailwindcss-v4',
      'mpx-tailwindcss-v3',
      'mpx-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v3',
      'taro-webpack-react-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v3',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v3',
      'taro-webpack-vue3-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v3',
      'taro-vite-vue3-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v3',
      'uni-app-vite-tailwindcss-v4',
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
      'uni-app-x-hbuilderx-tailwindcss-v3',
      'uni-app-x-hbuilderx-tailwindcss-v4',
      'weapp-vite-tailwindcss-v3',
      'weapp-vite-tailwindcss-v4',
    ])
  })

  it('covers every demo/web Vite package with browser source HMR', () => {
    expect(webViteHmrCaseNames).toEqual([
      'web react vite Tailwind v3',
      'web react vite Tailwind v4',
      'web vue vite Tailwind v3',
      'web vue vite Tailwind v4',
    ])
  })

  it('covers every Taro demo package with browser source HMR', () => {
    expect(taroWebHmrCaseNames).toEqual([
      'taro vite react Tailwind v3',
      'taro vite react Tailwind v4',
      'taro vite vue3 Tailwind v3',
      'taro vite vue3 Tailwind v4',
      'taro webpack react Tailwind v3',
      'taro webpack react Tailwind v4',
      'taro webpack vue3 Tailwind v3',
      'taro webpack vue3 Tailwind v4',
    ])
  })
})
