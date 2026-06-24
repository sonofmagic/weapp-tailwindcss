import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DEMO_USER_WORKFLOW_CASES } from '../../../e2e/demo-user-workflow-cases'

interface DemoPackageJson {
  scripts?: Record<string, string>
}

function readDemoPackageJson(projectDir: string): DemoPackageJson {
  return JSON.parse(
    readFileSync(path.resolve(__dirname, '../../..', projectDir, 'package.json'), 'utf8'),
  ) as DemoPackageJson
}

function resolvePnpmRunScript(command: string[]) {
  return command[0] === 'pnpm' && command[1] === 'run'
    ? command[2]
    : undefined
}

function resolveDevScriptCandidates(item: (typeof DEMO_USER_WORKFLOW_CASES)[number]) {
  const buildScript = resolvePnpmRunScript(item.command)
  const platformDevScript = `dev:${item.platform}`
  const candidates = new Set<string>()
  if (buildScript?.startsWith('build:')) {
    candidates.add(`dev:${buildScript.slice('build:'.length)}`)
  }
  candidates.add(platformDevScript)
  candidates.add('dev')
  return [...candidates]
}

describe('demo user workflow e2e matrix', () => {
  it('covers H5 and multiple non-WeChat mini-program platforms', () => {
    expect(DEMO_USER_WORKFLOW_CASES.some(item => item.platform === 'h5')).toBe(true)
    expect(DEMO_USER_WORKFLOW_CASES.some(item => item.platform === 'mp-weixin' || item.platform === 'wx')).toBe(true)

    const nonWechatMiniPlatforms = new Set(
      DEMO_USER_WORKFLOW_CASES
        .filter(item => item.userWorkflow.surfaces.includes('mini-program'))
        .map(item => item.platform)
        .filter(platform => platform !== 'mp-weixin' && platform !== 'wx'),
    )
    expect([...nonWechatMiniPlatforms]).toEqual(expect.arrayContaining([
      'mp-alipay',
      'mp-toutiao',
      'mp-qq',
      'alipay',
      'tt',
      'ali',
      'swan',
    ]))
  })

  it('keeps real platform style suffixes and framework families explicit', () => {
    const suffixes = new Set(DEMO_USER_WORKFLOW_CASES.flatMap(item => item.userWorkflow.styleSuffixes))
    expect([...suffixes]).toEqual(expect.arrayContaining([
      '.css',
      '.wxss',
      '.acss',
      '.ttss',
      '.qss',
      '.swan',
    ]))

    expect(new Set(DEMO_USER_WORKFLOW_CASES.map(item => item.framework))).toEqual(new Set([
      'uni-app',
      'taro',
      'mpx',
      'gulp',
    ]))
  })

  it('covers developer-facing class sources beyond static template literals', () => {
    const surfaces = new Set(DEMO_USER_WORKFLOW_CASES.flatMap(item => item.userWorkflow.surfaces))
    expect([...surfaces]).toEqual(expect.arrayContaining([
      'h5',
      'mini-program',
      'build-style-integrity',
      'dev-hmr-style-integrity',
      'vue-sfc-template',
      'vue-sfc-script-class',
      'tsx-className',
      'mpx-sfc-template',
      'mpx-dynamic-class',
      'native-template',
      'script-dynamic-class',
      'user-authored-style',
      'third-party-component-style',
      'third-party-library-style',
      'third-party-component-usage',
      'ordinary-css',
      'ordinary-scss',
      'tailwind-layer',
      'subpackage',
      'iconify',
    ]))

    for (const item of DEMO_USER_WORKFLOW_CASES) {
      expect(item.userWorkflow.assertions.length, `${item.name} should assert output behavior`).toBeGreaterThan(0)
      expect(item.requiredFiles.length, `${item.name} should assert real build output files`).toBeGreaterThan(0)
    }
  })

  it('makes user-authored and third-party style preservation part of the CI matrix', () => {
    const styleIntegrityCases = DEMO_USER_WORKFLOW_CASES.filter(item =>
      item.userWorkflow.surfaces.includes('build-style-integrity'),
    )
    expect(styleIntegrityCases.map(item => item.name)).toEqual(expect.arrayContaining([
      'uni-app-vite-tailwindcss-v4 h5',
      'mpx-tailwindcss-v4 wx',
      'taro-webpack-react-tailwindcss-v4 alipay',
    ]))

    const h5StyleIntegrity = styleIntegrityCases.filter(item => item.userWorkflow.surfaces.includes('h5'))
    const miniProgramStyleIntegrity = styleIntegrityCases.filter(item => item.userWorkflow.surfaces.includes('mini-program'))
    expect(h5StyleIntegrity.length).toBeGreaterThan(0)
    expect(miniProgramStyleIntegrity.length).toBeGreaterThan(0)

    expect(styleIntegrityCases.some(item => item.userWorkflow.surfaces.includes('user-authored-style'))).toBe(true)
    expect(styleIntegrityCases.some(item => item.userWorkflow.surfaces.includes('third-party-component-style'))).toBe(true)
    expect(styleIntegrityCases.some(item => item.userWorkflow.surfaces.includes('third-party-library-style'))).toBe(true)
    expect(styleIntegrityCases.every(item => item.userWorkflow.surfaces.includes('dev-hmr-style-integrity'))).toBe(true)

    const assertionLabels = styleIntegrityCases.flatMap(item => item.userWorkflow.assertions.map(assertion => assertion.label))
    expect(assertionLabels).toEqual(expect.arrayContaining([
      'uni-app H5 build 保留用户在 tailwind.scss 中写的普通样式',
      'uni-app H5 build 保留用户引入的第三方组件库样式',
      'Mpx 微信小程序 build 保留用户在 SFC 中写的普通样式',
      'Mpx 微信小程序 build 保留用户引入的第三方组件样式',
      'Taro Webpack 支付宝小程序 build 保留页面用户自写样式',
    ]))
  })

  it('keeps every demo H5 and mini-program build case paired with a dev script', () => {
    const h5AndMiniProgramCases = DEMO_USER_WORKFLOW_CASES.filter(item =>
      item.status === 'ci'
      && (
        item.userWorkflow.surfaces.includes('h5')
        || item.userWorkflow.surfaces.includes('mini-program')
      ),
    )

    expect(h5AndMiniProgramCases.length).toBeGreaterThan(0)

    for (const item of h5AndMiniProgramCases) {
      const pkg = readDemoPackageJson(item.projectDir)
      const scripts = pkg.scripts ?? {}
      const buildScript = resolvePnpmRunScript(item.command)
      if (buildScript) {
        expect(
          scripts[buildScript],
          `${item.name} should keep package script "${buildScript}" for build regression coverage`,
        ).toBeTruthy()
      }

      const devCandidates = resolveDevScriptCandidates(item)
      expect(
        devCandidates.some(script => typeof scripts[script] === 'string' && scripts[script].length > 0),
        `${item.name} should expose one of dev scripts: ${devCandidates.join(', ')}`,
      ).toBe(true)
    }
  })

  it('keeps demo dev and build chains split across H5 and mini-program surfaces', () => {
    const ciCases = DEMO_USER_WORKFLOW_CASES.filter(item => item.status === 'ci')
    const h5Cases = ciCases.filter(item => item.userWorkflow.surfaces.includes('h5'))
    const miniProgramCases = ciCases.filter(item => item.userWorkflow.surfaces.includes('mini-program'))

    expect(h5Cases.some(item => item.command.includes('build:h5'))).toBe(true)
    expect(h5Cases.some(item => resolveDevScriptCandidates(item).includes('dev:h5'))).toBe(true)
    expect(miniProgramCases.some(item => item.framework === 'uni-app')).toBe(true)
    expect(miniProgramCases.some(item => item.framework === 'taro')).toBe(true)
    expect(miniProgramCases.some(item => item.framework === 'mpx')).toBe(true)
    expect(miniProgramCases.some(item => item.framework === 'gulp')).toBe(true)

    for (const item of [...h5Cases, ...miniProgramCases]) {
      expect(item.styleFiles.length, `${item.name} should assert style outputs`).toBeGreaterThan(0)
      expect(item.styleContains.length, `${item.name} should assert generated style content`).toBeGreaterThan(0)
    }
  })
})
