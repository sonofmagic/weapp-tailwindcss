import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { createArtifactVisualSeed, createPortAwareCommand, disableDevToolsCompileHotReload, miniProgramPageMatchesRoute, miniProgramProjectStartsAtRoute } from '../scripts/demo-visual-e2e-report/cases'
import { parseWechatDevToolsWindowBounds } from '../scripts/demo-visual-e2e-report/ide'
import { createHmrComparisons, mergeCaseResults } from '../scripts/demo-visual-e2e-report/report'
import { analyzeThemeCss, countDarkPixels } from '../scripts/demo-visual-e2e-report/theme'
import { uniAppXAppCases } from './hbuilderx-local/cases'

describe('demo visual theme evidence', () => {
  it('uses each web case command and resolves its dynamic port', () => {
    expect(createPortAwareCommand(['exec', 'nuxt', 'dev', '--port', '{port}'], 4173)).toEqual([
      'exec',
      'nuxt',
      'dev',
      '--port',
      '4173',
    ])
    expect(createPortAwareCommand(['exec', 'vite'], 4173)).toEqual(['exec', 'vite', '--port', '4173'])
  })

  it('recognizes an already active mini-program route before reLaunch', () => {
    expect(miniProgramPageMatchesRoute({ path: 'pages/index/index' }, '/pages/index/index')).toBe(true)
    expect(miniProgramPageMatchesRoute({ path: '/pages/other/index' }, '/pages/index/index')).toBe(false)
    expect(miniProgramPageMatchesRoute({}, '/pages/index/index')).toBe(false)
  })

  it('uses the emitted app manifest as the initial mini-program route', async () => {
    const projectRoot = await fs.mkdtemp(path.join(tmpdir(), 'demo-visual-app-manifest-'))
    await fs.writeFile(path.join(projectRoot, 'app.json'), JSON.stringify({ pages: ['pages/index/index'] }))

    expect(await miniProgramProjectStartsAtRoute(projectRoot, '/pages/index/index')).toBe(true)
    expect(await miniProgramProjectStartsAtRoute(projectRoot, '/pages/other/index')).toBe(false)
    await fs.rm(projectRoot, { recursive: true, force: true })
  })

  it('validates the native DevTools window screenshot bounds', () => {
    expect(parseWechatDevToolsWindowBounds('10, 20, 1200, 800')).toBe('10,20,1200,800')
    expect(() => parseWechatDevToolsWindowBounds('10,20,0,800')).toThrow('窗口尺寸无效')
    expect(() => parseWechatDevToolsWindowBounds('not-bounds')).toThrow('无法解析')
  })

  it('derives diagnostic visual evidence from the built artifact state', () => {
    const before = createArtifactVisualSeed([{ content: '.bg-red{}', file: 'app.wxss' }])
    const after = createArtifactVisualSeed([{ content: '.bg-blue{}', file: 'app.wxss' }])
    expect(before).not.toBe(after)
  })

  it('keeps the uni-app x App entry valid for native App compilation', async () => {
    const files = [
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/App.uvue',
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/pages/index/index.uvue',
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/components/BindClass.uvue',
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/components/WeappTailwindcss.uvue',
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/sub-normal/pages/index.uvue',
      'demo/uni-app-x-hbuilderx-tailwindcss-v4/sub-independent/pages/index.uvue',
    ]
    for (const file of files) {
      const source = await fs.readFile(path.resolve(file), 'utf8')
      expect(source, file).toContain('<script lang="uts">')
      expect(source, file).not.toContain('<script setup')
    }
  })

  it('uses the uni-app x component-local style probe on Android and iOS', () => {
    const android = uniAppXAppCases.find(item => item.platform === 'app-android')
    const ios = uniAppXAppCases.find(item => item.platform === 'app-ios')
    expect(android?.requiredFiles).toContain('App.uvue.ts')
    expect(android?.sourceFile).toBe('components/BindClass.uvue')
    expect(android?.transformedOutputFiles).toContain('components/BindClass.uvue.ts')
    expect(ios?.sourceFile).toBe('components/BindClass.uvue')
    expect(ios?.markerAnchor).toBe('<text :class="flag')
  })

  it('keeps issue #1002 utilities in the uni-app x native runtime probes', async () => {
    const page = await fs.readFile(path.resolve('demo/uni-app-x-hbuilderx-tailwindcss-v4/pages/index/index.uvue'), 'utf8')

    for (const utility of ['text-xs', 'text-sm', 'text-base', 'text-xl', 'text-white', 'rounded-full']) {
      expect(page, `issue #1002 probe should include ${utility}`).toContain(utility)
    }
    expect(page).toContain('@apply text-xs text-white rounded-full bg-[#164e63];')

    for (const item of uniAppXAppCases) {
      expect(item.markerClass).toContain('rounded-full')
      expect(item.markerTextClass).toContain('text-xl')
      expect(item.markerTextClass).toContain('text-white')
      expect(item.hmrMarkerTextClass).toContain('text-sm')
      expect(item.hmrMarkerTextClass).toContain('text-white')
      expect([
        ...(item.transformedNotContains ?? []),
        ...(item.styleNotContains ?? []),
      ]).toEqual(expect.arrayContaining([
        '.tw-root',
        'calc(infinity',
        'var(--color-white)',
      ]))
      if (item.platform === 'app-android') {
        expect(item.compiledStyleContains?.length).toBeGreaterThanOrEqual(8)
      }
      expect(item.logNotContains?.length).toBeGreaterThan(0)
    }
  })

  it('does not pin Harmony visual coverage to a machine-specific device', () => {
    const harmony = uniAppXAppCases.find(item => item.platform === 'app-harmony')
    if (!process.env['E2E_HBUILDERX_HARMONY_DEVICE_ID'] && !process.env['DEMO_VISUAL_HARMONY_DEVICE_ID']) {
      expect(harmony?.launchArgs).toEqual([])
    }
  })

  it('enables uni-app x local utility styles for every isolation version', async () => {
    const config = await fs.readFile(path.resolve('demo/uni-app-x-hbuilderx-tailwindcss-v4/vite.config.ts'), 'utf8')
    expect(config).toContain('componentLocalStyles: {')
    expect(config).toContain('onlyWhenStyleIsolationVersion2: false')
  })

  it('detects system and manual dark mode selectors in mini-program css output', () => {
    const css = [
      '@media (prefers-color-scheme: dark) { .system-dark_cbg-slate-900 { background-color: #0f172a; } }',
      '.theme-dark .dark_cbg-zinc-950 { background-color: #09090b; }',
    ].join('\n')

    expect(analyzeThemeCss(css)).toEqual({
      hasManualDarkSelector: true,
      hasUnsupportedThemeAttributeSelector: false,
      hasUnsupportedThemeComplexSelector: false,
      hasSystemDarkMedia: true,
    })
  })

  it('rejects mini-program unsupported attribute and complex selectors', () => {
    expect(analyzeThemeCss('.theme-dark [disabled] { opacity: .5 }').hasUnsupportedThemeAttributeSelector).toBe(true)
    expect(analyzeThemeCss('.dark_cbg-zinc-900:not(view):not(text) { background: #000 }').hasUnsupportedThemeComplexSelector).toBe(true)
    expect(analyzeThemeCss('.theme-dark:where(.active, .current) { color: #fff }').hasUnsupportedThemeComplexSelector).toBe(true)
    expect(analyzeThemeCss('.t-button__content:not(:empty) { display: inline }').hasUnsupportedThemeComplexSelector).toBe(false)
  })

  it('keeps third-party attribute selectors outside theme selector checks', () => {
    const evidence = analyzeThemeCss(`.nut-rtl .nut-toast,
[dir='rtl'] .nut-toast {
  left: auto;
  right: 0;
}
.theme-dark .dark_cbg-zinc-950 {
  background-color: #09090b;
}`)
    expect(evidence.hasManualDarkSelector).toBe(true)
    expect(evidence.hasUnsupportedThemeAttributeSelector).toBe(false)
    expect(evidence.hasUnsupportedThemeComplexSelector).toBe(false)
  })

  it('counts dark pixels inside the sampled screenshot rectangle', () => {
    const png = new PNG({ height: 4, width: 4 })
    png.data.fill(255)
    for (let y = 1; y <= 2; y++) {
      for (let x = 1; x <= 2; x++) {
        const index = (png.width * y + x) * 4
        png.data[index] = 9
        png.data[index + 1] = 9
        png.data[index + 2] = 11
        png.data[index + 3] = 255
      }
    }

    expect(countDarkPixels(png, { height: 2, left: 1, top: 1, width: 2 })).toBe(4)
    expect(countDarkPixels(png, { height: 1, left: 0, top: 0, width: 1 })).toBe(0)
  })

  it('temporarily disables DevTools auto reload and restores the exact config', async () => {
    const projectRoot = await fs.mkdtemp(path.join(tmpdir(), 'demo-visual-project-config-'))
    const projectConfigFile = path.join(projectRoot, 'project.config.json')
    const source = '{\n  "setting": {\n    "compileHotReLoad": true\n  }\n}'
    await fs.writeFile(projectConfigFile, source)

    const restore = await disableDevToolsCompileHotReload(projectRoot)
    expect(JSON.parse(await fs.readFile(projectConfigFile, 'utf8')).setting.compileHotReLoad).toBe(false)

    await restore()
    expect(await fs.readFile(projectConfigFile, 'utf8')).toBe(source)
    await fs.rm(projectRoot, { recursive: true, force: true })
  })

  it('merges platform reports while replacing the current case result', () => {
    const previous = [
      { name: 'demo-a', platform: 'h5', status: 'failed' as const },
      { name: 'demo-a', platform: 'weapp', status: 'passed' as const },
    ]
    const current = [
      { name: 'demo-a', platform: 'h5', status: 'passed' as const },
      { name: 'demo-b', platform: 'app-android', status: 'passed' as const },
    ]

    expect(mergeCaseResults(previous, current)).toEqual([
      { name: 'demo-a', platform: 'h5', status: 'passed' },
      { name: 'demo-a', platform: 'weapp', status: 'passed' },
      { name: 'demo-b', platform: 'app-android', status: 'passed' },
    ])
  })

  it('keeps incremental report generation working when previous screenshots are absent', () => {
    const results = [{
      hmrAfterScreenshot: '/missing/after.png',
      hmrBeforeScreenshot: '/missing/before.png',
      hmrSteps: [{
        afterScreenshot: '/missing/step-after.png',
        beforeScreenshot: '/missing/step-before.png',
        name: 'background',
      }],
      name: 'demo-a',
      platform: 'weapp' as const,
      status: 'passed' as const,
    }]

    expect(() => createHmrComparisons(results, {
      artifactRoot: '/missing/artifacts',
    } as never)).not.toThrow()
    expect(results[0].status).toBe('passed')
  })
})
