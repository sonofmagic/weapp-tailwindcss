import { describe, expect, it } from 'vitest'

import { miniProgramCases, uniAppAppCases, uniAppXAppCases, webCases } from '../../../e2e/hbuilderx-local/cases'
import { filterHBuilderXCases, matchesHBuilderXCaseFilter, parseCaseNameFilters } from '../../../e2e/hbuilderx-local/filters'
import { findHBuilderXDeviceUnavailableLog } from '../../../e2e/hbuilderx-local/runner'

const hbuilderxDemoNames = [
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v4',
]
const hbuilderxMiniProgramCaseNames = [
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-alipay',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-baidu',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-toutiao',
  'uni-app-x-hbuilderx-tailwindcss-v4',
]

function expectContainsMatcher(entries: Array<string | RegExp>, matcher: string | RegExp, message: string) {
  const ok = entries.some((entry) => {
    if (typeof matcher === 'string') {
      return typeof entry === 'string' && entry.includes(matcher)
    }
    return typeof entry === 'string' ? matcher.test(entry) : String(entry) === String(matcher)
  })

  expect(ok, message).toBe(true)
}

describe('HBuilderX local demo matrix', () => {
  it('fails fast when HBuilderX reports a missing device without exiting', () => {
    expect(findHBuilderXDeviceUnavailableLog('未检测到指定设备 emulator-5554')).toBe('未检测到指定设备')
    expect(findHBuilderXDeviceUnavailableLog('emulator-5556 offline')).toBe('emulator-5556 offline')
    expect(findHBuilderXDeviceUnavailableLog('项目编译成功')).toBeUndefined()
  })

  it('keeps every HBuilderX demo covered by local mini-program and Web HMR cases', () => {
    expect(miniProgramCases.map(item => item.name)).toEqual(hbuilderxMiniProgramCaseNames)
    expect(webCases.map(item => item.name)).toEqual(hbuilderxDemoNames)

    for (const name of hbuilderxDemoNames) {
      const miniProgramCase = miniProgramCases.find(item => item.name === name && item.platform === 'mp-weixin')
      const webCase = webCases.find(item => item.name === name)

      expect(miniProgramCase?.workflow.staticTemplateClass, `${name} should cover template classes in mini-program output`).toBe(true)
      expect(miniProgramCase?.workflow.subpackageStyle, `${name} should cover normal and independent subpackage styles`).toBe(true)
      expect(miniProgramCase?.cssNotContains?.length, `${name} should reject leaked Tailwind directives`).toBeGreaterThan(0)
      expect(miniProgramCase?.requiredFiles, `${name} should require normal subpackage output`).toContain('sub-normal/pages/index.json')
      expect(miniProgramCase?.requiredFiles, `${name} should require independent subpackage output`).toContain('sub-independent/pages/index.json')
      expect(webCase?.workflow.webHmr, `${name} should cover H5 dev HMR`).toBe(true)
      expect(webCase?.hmrSteps.length, `${name} should simulate multiple user edits during H5 dev`).toBeGreaterThanOrEqual(3)
      for (const step of webCase?.hmrSteps ?? []) {
        expect(step.markerClass, `${name} HMR step should replace user-authored classes on one probe`).toContain('hbuilderx-web-hmr-probe bg-[#')
        expect(step.cssContains.length, `${name} HMR step should assert generated CSS`).toBeGreaterThanOrEqual(3)
        expect(step.runtimeStyles?.[0]?.selector, `${name} HMR step should assert the replaced probe at runtime`).toBe('.hbuilderx-web-hmr-probe')
      }
    }
  })

  it('keeps ordinary uni-app HBuilderX local mini-program coverage across supported non-WeChat platforms', () => {
    const ordinaryCases = miniProgramCases.filter(item => item.projectDir.includes('uni-app-vite-vue3-hbuilderx'))
    const casesByProject = new Map<string, typeof ordinaryCases>()

    for (const item of ordinaryCases) {
      casesByProject.set(item.projectDir, [...(casesByProject.get(item.projectDir) ?? []), item])
    }

    for (const [projectDir, cases] of casesByProject) {
      expect(cases.map(item => item.platform), `${projectDir} should cover HBuilderX mini-program platforms`).toEqual([
        'mp-weixin',
        'mp-alipay',
        'mp-baidu',
        'mp-toutiao',
      ])
      expect(cases.find(item => item.platform === 'mp-weixin')?.cssFiles).toContain('app.wxss')
      expect(cases.find(item => item.platform === 'mp-alipay')?.cssFiles).toContain('app.acss')
      expect(cases.find(item => item.platform === 'mp-baidu')?.cssFiles).toContain('app.css')
      expect(cases.find(item => item.platform === 'mp-toutiao')?.cssFiles).toContain('app.ttss')
      expect(cases.find(item => item.platform === 'mp-weixin')?.outputContains?.['sub-normal/pages/index.wxml']).toContain('bg-normal-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-alipay')?.outputContains?.['sub-normal/pages/index.axml']).toContain('bg-normal-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-baidu')?.outputContains?.['sub-normal/pages/index.swan']).toContain('bg-normal-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-toutiao')?.outputContains?.['sub-normal/pages/index.ttml']).toContain('bg-normal-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-weixin')?.outputContains?.['sub-independent/pages/index.wxml']).toContain('bg-independent-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-alipay')?.outputContains?.['sub-independent/pages/index.axml']).toContain('bg-independent-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-baidu')?.outputContains?.['sub-independent/pages/index.swan']).toContain('bg-independent-subpackage-marker')
      expect(cases.find(item => item.platform === 'mp-toutiao')?.outputContains?.['sub-independent/pages/index.ttml']).toContain('bg-independent-subpackage-marker')
    }
  })

  it('keeps uni-app-x HBuilderX mini-program coverage limited to mp-weixin while HBuilderX rejects other mini-program targets', () => {
    const uniAppXMiniProgramCases = miniProgramCases.filter(item => item.projectDir.includes('uni-app-x-hbuilderx'))

    expect(uniAppXMiniProgramCases.map(item => item.name)).toEqual([
      'uni-app-x-hbuilderx-tailwindcss-v4',
    ])
    expect(uniAppXMiniProgramCases.map(item => item.platform)).toEqual(['mp-weixin'])
  })

  it('keeps uni-app-x HBuilderX cases covering dynamic classes, user styles and component styles', () => {
    for (const name of hbuilderxDemoNames.filter(item => item.startsWith('uni-app-x-'))) {
      const miniProgramCase = miniProgramCases.find(item => item.name === name)
      const webCase = webCases.find(item => item.name === name)

      expect(miniProgramCase?.workflow.dynamicClassBinding, `${name} should cover dynamic :class bindings`).toBe(true)
      expect(miniProgramCase?.workflow.userAuthoredStyle, `${name} should cover user-authored style output`).toBe(true)
      expect(miniProgramCase?.workflow.thirdPartyOrExternalComponentStyle, `${name} should cover component/library style output`).toBe(true)
      expectContainsMatcher(miniProgramCase?.cssContains ?? [], '.bg-_b_h87add3_B', `${name} should keep component static style utilities`)
      expectContainsMatcher(miniProgramCase?.cssContains ?? [], '.bg-_b_hd2e252_B', `${name} should keep component dynamic style utilities`)
      expectContainsMatcher(miniProgramCase?.cssContains ?? [], '.text-_b93_d54rpx_B', `${name} should keep arbitrary dynamic text utilities`)
      expectContainsMatcher(miniProgramCase?.cssContains ?? [], '.bg-_b_hf21903_B', `${name} should keep page user-authored style utilities`)
      expectContainsMatcher(miniProgramCase?.cssContains ?? [], '.text-_b_hda0e3c_B', `${name} should keep page user-authored text utilities`)
      expectContainsMatcher(webCase?.initialCssContains ?? [], /background-color:\s*#f21903/, `${name} should verify generated H5 CSS from page user styles`)
      expect(miniProgramCase?.outputContains?.['app.json'], `${name} should verify subpackage registration`).toEqual([
        '"root": "sub-normal"',
        '"root": "sub-independent"',
        '"independent": true',
      ])
      expect(miniProgramCase?.outputContains?.['sub-normal/pages/index.wxml'], `${name} should verify normal subpackage marker`).toContain('bg-normal-subpackage-marker')
      expect(miniProgramCase?.outputContains?.['sub-independent/pages/index.wxml'], `${name} should verify independent subpackage marker`).toContain('bg-independent-subpackage-marker')
    }
  })

  it('keeps local App coverage explicit for supported HBuilderX demo platforms', () => {
    const appCaseNames = [...uniAppAppCases, ...uniAppXAppCases].map(item => item.name)

    expect(appCaseNames).toContain('uni-app-vite-vue3-hbuilderx-tailwindcss-v4 android')
    expect(appCaseNames).toContain('uni-app-vite-vue3-hbuilderx-tailwindcss-v4 ios')
    expect(appCaseNames).toContain('uni-app-x-hbuilderx-tailwindcss-v4 android')
    expect(appCaseNames).toContain('uni-app-x-hbuilderx-tailwindcss-v4 ios')
    expect(appCaseNames).toContain('uni-app-x-hbuilderx-tailwindcss-v4 harmony')
  })

  it('filters local HBuilderX e2e cases by demo name without requiring Vitest -t suffix matching', () => {
    const filters = parseCaseNameFilters('uni-app-x-hbuilderx-tailwindcss-v4, uni-app-vite-vue3-hbuilderx-tailwindcss-v4')

    expect(matchesHBuilderXCaseFilter('uni-app-x-hbuilderx-tailwindcss-v4 harmony', filters)).toBe(true)
    expect(matchesHBuilderXCaseFilter('uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-alipay', filters)).toBe(true)
    expect(matchesHBuilderXCaseFilter('uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-baidu', ['uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-alipay'])).toBe(false)
    expect(filterHBuilderXCases(miniProgramCases, filters).map(item => item.name)).toEqual([
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-alipay',
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-baidu',
      'uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-toutiao',
      'uni-app-x-hbuilderx-tailwindcss-v4',
    ])
  })
})
