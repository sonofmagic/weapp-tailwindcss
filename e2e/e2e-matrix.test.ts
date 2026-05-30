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
import { MULTIPLATFORM_TARGETS } from './multiplatform-build-output/targets'
import { webViteHmrCaseNames } from './web-vite-demo-hmr-cases'

interface DemoPackageJson {
  scripts?: Record<string, string>
}

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

  it('covers every platform-looking demo script in the demo coverage matrix', () => {
    for (const entry of DEMO_COVERAGE_MATRIX) {
      const pkg = readDemoPackageJson(entry.packageJson)
      const platforms = new Set(entry.platforms.map(item => item.platform))
      const missing = Object.keys(pkg.scripts ?? {})
        .map(platformFromScriptName)
        .filter((platform): platform is string => Boolean(platform))
        .filter(platform => !platforms.has(platform))

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

  it('wires local/default platform entries to the multiplatform target matrix', () => {
    const targets = new Set(MULTIPLATFORM_TARGETS.map(item => `${item.projectDir.replace('demo/', '')}:${item.platform}`))
    for (const entry of DEMO_COVERAGE_MATRIX.filter(item => ['mpx', 'taro-react', 'taro-vue3', 'uni-app', 'uni-app-x'].includes(item.framework))) {
      for (const platform of entry.platforms) {
        if (entry.name.includes('hbuilderx') && entry.framework === 'uni-app') {
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
})
