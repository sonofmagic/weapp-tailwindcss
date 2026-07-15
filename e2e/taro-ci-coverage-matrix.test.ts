import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { DEMO_COVERAGE_MATRIX } from './demoCoverageMatrix'
import { E2E_PROJECTS } from './projectEntries'
import { taroWebHmrCases } from './taro-web-demo-hmr-cases'

const repoRoot = path.resolve(__dirname, '..')
const coreTaroDemos = [
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
] as const
const taroViteDemoConfigs = [
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'issue-951-taro-vite-react-tailwindcss-v4',
] as const
const taroViteTemplateConfigs = [
  'taro-vite-tailwindcss-v4',
] as const
const taroWatchCaseEnv = 'TARO_E2E_WATCH_NATIVE=0 E2E_WATCH_MINI_PROGRAM_ONLY=1 E2E_WATCH_MAX_PLUGIN_PROCESS_MS=8000 E2E_WATCH_COMMAND_TIMEOUT_MS=900000'

const requiredScripts = ['build:weapp', 'dev:weapp', 'build:h5', 'dev:h5'] as const
const forbiddenTailwindGeneratorPlugins = [
  '@tailwindcss/postcss',
  '@tailwindcss/vite',
] as const
const forbiddenTaroViteConfigCompatSnippets = [
  'taroAlipayBrowserslistAssetPlugin',
  'taro-alipay-browserslist-asset',
  'taro-cjs-stability',
  'transformMixedEsModules',
  'bundle[\'.browserslistrc\']',
  'fileName: \'.browserslistrc\'',
] as const

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as { scripts?: Record<string, string> }
}

function readText(file: string) {
  return fs.readFileSync(file, 'utf8')
}

function demoPackageJson(name: string) {
  return readJson(path.join(repoRoot, 'demo', name, 'package.json'))
}

function configFiles(name: string) {
  const configRoot = path.join(repoRoot, 'demo', name, 'config')
  return fs.readdirSync(configRoot)
    .filter(file => /\.[cm]?ts$|\.js$/.test(file))
    .map(file => path.join(configRoot, file))
}

function taroHmrCaseName(name: string) {
  return name.replaceAll('-', ' ').replace('tailwindcss v', 'Tailwind v')
}

describe('Taro CI coverage matrix', () => {
  it('declares the four core Taro demos with mini-program and H5 build/dev scripts', () => {
    const entries = DEMO_COVERAGE_MATRIX
      .filter(item => item.framework === 'taro-react' || item.framework === 'taro-vue3')
      .filter(item => coreTaroDemos.includes(item.name as typeof coreTaroDemos[number]))
      .map(item => item.name)
      .sort()

    expect(entries).toEqual([...coreTaroDemos].sort())

    for (const name of coreTaroDemos) {
      const scripts = demoPackageJson(name).scripts ?? {}
      for (const script of requiredScripts) {
        expect(scripts[script], `${name} should expose ${script}`).toBeDefined()
      }
      expect(scripts['build:weapp'], `${name} mini-program build should use the guarded Taro build entry`).toContain('taro-build-guard.mjs')
      expect(scripts['dev:weapp'], `${name} mini-program dev should run the guarded build in watch mode`).toContain('--watch')
      expect(scripts['build:h5'], `${name} H5 build should use the Taro build runner`).toContain('taro-build-runner.mjs build --type h5')
      expect(scripts['dev:h5'], `${name} H5 dev should run Taro H5 watch`).toContain('taro build --type h5 --watch')
    }
  })

  it('wires all four Taro demos to CI-readable mini-program and H5 e2e evidence', () => {
    const rootScripts = readJson(path.join(repoRoot, 'package.json')).scripts ?? {}
    expect(rootScripts['e2e:taro']).toBe('pnpm e2e:taro:mp && pnpm e2e:taro:h5')
    expect(rootScripts['e2e:taro:mp']).toContain('E2E_PROJECT_FILTER="^taro-(vite|webpack)-(react|vue3)-tailwindcss-v4$"')
    expect(rootScripts['e2e:taro:mp']).toContain('TARO_E2E_WATCH_NATIVE=0')
    expect(rootScripts['e2e:taro:mp']).toContain('E2E_WATCH_MINI_PROGRAM_ONLY=1')
    expect(rootScripts['e2e:taro:mp']).toContain('E2E_WATCH_MAX_PLUGIN_PROCESS_MS=8000')
    expect(rootScripts['e2e:taro:mp']).toContain('E2E_WATCH_COMMAND_TIMEOUT_MS=900000')
    expect(rootScripts['e2e:taro:mp']).not.toContain('E2E_WATCH_CASE=demo-taro-react')
    expect(rootScripts['e2e:taro:mp']).not.toContain('E2E_WATCH_CASE=demo-taro-vue3')
    for (const name of coreTaroDemos) {
      expect(rootScripts['e2e:taro:mp'], `${name} should run as a standalone watch-HMR step`).toContain(`${taroWatchCaseEnv} E2E_WATCH_CASE=${name} pnpm e2e:watch`)
    }
    expect(rootScripts['e2e:taro:h5']).toBe('pnpm e2e:taro:h5-build && pnpm e2e:taro:web-hmr')

    const staticMiniProgramProjects = new Set(E2E_PROJECTS.map(item => item.name))
    const h5HmrProjects = new Set(taroWebHmrCases.map(item => item.projectDir.replace('demo/', '')))
    const h5HmrCaseNames = new Set(taroWebHmrCases.map(item => item.name))
    const devSmokeSource = readText(path.join(repoRoot, 'e2e/watch/taro-demo-dev.test.ts'))

    for (const name of coreTaroDemos) {
      expect(staticMiniProgramProjects.has(name), `${name} should run static mini-program e2e build assertions`).toBe(true)
      expect(h5HmrProjects.has(name), `${name} should run browser H5 HMR e2e`).toBe(true)
      expect(h5HmrCaseNames.has(taroHmrCaseName(name)), `${name} should have a named H5 HMR case`).toBe(true)
      expect(fs.existsSync(path.join(repoRoot, `e2e/watch/hot-update/demo/${name}.test.ts`)), `${name} should have mini-program watch-HMR e2e`).toBe(true)
      expect(devSmokeSource, `${name} should be included in pnpm dev watch smoke`).toContain(`'${name}'`)
    }
  })

  it('keeps Taro configs on weapp-tailwindcss instead of official Tailwind generator plugins', () => {
    for (const name of coreTaroDemos) {
      const config = configFiles(name).map(readText).join('\n')
      expect(config, `${name} should register WeappTailwindcss`).toContain('WeappTailwindcss')
      expect(config, `${name} should declare cssEntries for Tailwind v4`).toContain('cssEntries')
      for (const plugin of forbiddenTailwindGeneratorPlugins) {
        expect(config, `${name} should not use ${plugin}`).not.toContain(plugin)
      }
    }
  })

  it('keeps H5 designWidth numeric while issue 998 uses file-aware mini-program sizing', () => {
    for (const name of ['taro-vite-react-tailwindcss-v4', 'taro-webpack-react-tailwindcss-v4']) {
      const config = configFiles(name).map(readText).join('\n')
      expect(config, `${name} should preserve numeric designWidth for H5`).toContain('designWidth: taroPlatform.isWeb')
      expect(config, `${name} should preserve the original H5 design width`).toContain('? 750')
      expect(config, `${name} should retain the issue 998 file-aware mini-program branch`).toContain('file.includes(\'/pages/issue-998/\')')
    }
  })

  it('keeps Taro Vite demo and template configs free of compatibility plugins', () => {
    const configTargets = [
      ...taroViteDemoConfigs.map(name => ({
        name,
        files: configFiles(name),
      })),
      ...taroViteTemplateConfigs.map(name => ({
        name: `template:${name}`,
        files: configFiles(path.join('..', 'templates', name)),
      })),
    ]

    for (const target of configTargets) {
      const config = target.files.map(readText).join('\n')
      expect(config, `${target.name} should register WeappTailwindcss`).toContain('WeappTailwindcss')
      for (const snippet of forbiddenTaroViteConfigCompatSnippets) {
        expect(config, `${target.name} should rely on built-in Taro Vite compatibility instead of ${snippet}`).not.toContain(snippet)
      }
    }
  })
})
