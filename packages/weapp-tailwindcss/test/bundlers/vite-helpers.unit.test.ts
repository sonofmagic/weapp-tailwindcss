import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyCssResultToBundle,
  createMatchedCssSourceOutputResolver,
  hasViteProcessedCssResultForSource,
  resolveCssBundleOutputFile,
  resolveOutputFileFromMatchedCssSource,
  shouldSkipRawSourceStyleAsset,
} from '@/bundlers/vite/generate-bundle/css-output-helpers'
import {
  createCssImportShell,
  createRelativeCssImportRequest,
  createRootMiniProgramOriginStyleOutputFile,
  isRootMiniProgramStyleOutputFile,
  shouldKeepRootMiniProgramStyleAsImportShell,
  shouldMoveRootMiniProgramStyleToImportShellOrigin,
} from '@/bundlers/vite/generate-bundle/root-style-output'
import { resolveCurrentSourceCandidateSource } from '@/bundlers/vite/generate-bundle/source-candidate-source'
import {
  collectTailwindV4SourceFingerprint,
  isSameSubpackageScope,
  resolveSubpackageRootForFile,
  scoreConfiguredTailwindV4SourceForRawSource,
  selectTailwindV4GenerationCssSourceForOutput,
} from '@/bundlers/vite/generate-bundle/tailwind-v4-css-source'
import {
  createTemporaryCssAssetSourceResolver,
  isTemporaryCssAssetFile,
} from '@/bundlers/vite/generate-bundle/temporary-css-assets'
import {
  isMissingInternalCssSource,
  normalizeVitePersistentCacheKey,
  summarizeStringCache,
  summarizeViteProcessedCssResults,
  toMb,
} from '@/bundlers/vite/plugin-cache'

let tempRoots: string[] = []

afterEach(async () => {
  await Promise.all(tempRoots.map(root => rm(root, { force: true, recursive: true })))
  tempRoots = []
})

async function createTempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-helpers-'))
  tempRoots.push(root)
  return root
}

function createAsset(source: string, originalFileNames?: string[]) {
  return {
    type: 'asset' as const,
    fileName: 'style.wxss',
    source,
    originalFileNames,
  }
}

describe('bundlers/vite helper modules', () => {
  it('summarizes vite cache state and detects missing internal css sources', async () => {
    const root = await createTempRoot()
    const pkg = path.join(root, 'pkg')
    await mkdir(pkg)
    const existing = path.join(pkg, 'index.css')
    await writeFile(existing, '.a{}')

    expect(normalizeVitePersistentCacheKey('a\\b.css')).toBe('a/b.css')
    expect(toMb(1024 * 1024 * 1.6)).toBe(2)
    expect(summarizeStringCache(new Map([['a', '123'], ['b', '45']]))).toEqual({ bytes: 5, mb: 0, size: 2 })
    expect(summarizeViteProcessedCssResults(new Map([['a', { css: '1234' }]]))).toEqual({ bytes: 4, mb: 0, size: 1 })
    expect(isMissingInternalCssSource(path.join(pkg, 'missing.css'), pkg)).toBe(true)
    expect(isMissingInternalCssSource(existing, pkg)).toBe(false)
    expect(isMissingInternalCssSource(path.join(root, 'outside.css'), pkg)).toBe(false)
  })

  it('handles root mini-program style output and import shells', () => {
    expect(isRootMiniProgramStyleOutputFile('app.wxss?inline')).toBe(true)
    expect(isRootMiniProgramStyleOutputFile('pages/index.wxss')).toBe(false)
    expect(createRelativeCssImportRequest('app.wxss', 'app-origin.wxss')).toBe('./app-origin.wxss')
    expect(createRelativeCssImportRequest('pages/index.wxss', 'common/app.wxss')).toBe('../common/app.wxss')
    expect(createCssImportShell('pages/index.wxss', 'common/app.wxss')).toBe('@import "../common/app.wxss";\n')
    expect(createRootMiniProgramOriginStyleOutputFile('app.wxss')).toBe('app-origin.wxss')
    expect(createRootMiniProgramOriginStyleOutputFile('app-origin.wxss')).toBe('app-origin.wxss')
    expect(shouldKeepRootMiniProgramStyleAsImportShell('uni-app-vite')).toBe(true)
    expect(shouldKeepRootMiniProgramStyleAsImportShell('uni-app-x')).toBe(true)
    expect(shouldKeepRootMiniProgramStyleAsImportShell('taro')).toBe(true)
    expect(shouldKeepRootMiniProgramStyleAsImportShell('native')).toBe(false)
    expect(shouldMoveRootMiniProgramStyleToImportShellOrigin('taro')).toBe(true)
    expect(shouldMoveRootMiniProgramStyleToImportShellOrigin('uni-app-vite')).toBe(false)
  })

  it('resolves current source candidate source by explicit and scored candidates', () => {
    const rootDir = '/repo'
    const outDir = '/repo/dist'
    const sourceRoot = '/repo/src'
    const explicit = resolveCurrentSourceCandidateSource({
      file: 'pages/index/index.wxml?used',
      rootDir,
      outDir,
      sourceRoot,
      getSourceCandidateSource: file => file === '/repo/src/pages/index/index.wxml?used' ? 'explicit' : undefined,
    })
    expect(explicit).toBe('explicit')

    const scored = resolveCurrentSourceCandidateSource({
      file: 'pages/index/index.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => new Map([
        ['/repo/other/pages/index/index.wxml', 'suffix'],
        ['/repo/dist/pages/index/index.wxml', 'exact'],
      ]),
    })
    expect(scored).toBe('exact')
    const relativeExact = resolveCurrentSourceCandidateSource({
      file: 'relative.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => new Map([
        [path.resolve('relative.wxml'), 'relative-exact'],
      ]),
    })
    expect(relativeExact).toBe('relative-exact')
    expect(resolveCurrentSourceCandidateSource({ file: '/repo/src/absolute.wxml', rootDir, outDir })).toBeUndefined()
    expect(resolveCurrentSourceCandidateSource({
      file: '/repo/dist/pages/from-out-dir.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => [],
    })).toBeUndefined()
    const suffixOnly = resolveCurrentSourceCandidateSource({
      file: 'pages/index/index.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => new Map([
        ['/repo/other/pages/index/index.wxml', 'suffix'],
      ]),
    })
    expect(suffixOnly).toBe('suffix')
    const filenameFallback = resolveCurrentSourceCandidateSource({
      file: 'index.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => new Map([
        ['/repo/pages/other.wxml', 'not-matched'],
        ['/repo/pages/index.wxml', 'filename-fallback'],
        ['/repo/another/index.wxml', 'same-score-fallback'],
      ]),
    })
    expect(filenameFallback).toBe('filename-fallback')
    const missing = resolveCurrentSourceCandidateSource({
      file: 'pages/missing.wxml',
      rootDir,
      outDir,
      getSourceCandidateSources: () => [],
    })
    expect(missing).toBeUndefined()
  })

  it('selects configured Tailwind v4 css sources by fingerprint and subpackage scope', () => {
    const main = {
      file: 'app.css',
      source: '@import "tailwindcss"; @config "./tailwind.config.js"; @theme { --color-main: red; } .main-card{}',
    }
    const mainImplicit = {
      file: 'implicit.css',
      source: '@import "tailwindcss"; .implicit-card{}',
    }
    const mainExplicit = {
      file: 'explicit.css',
      source: '@import "tailwindcss"; @source "./src/**/*"; .explicit-card{}',
    }
    const sub = {
      file: 'sub/pages/index.css',
      source: '@import "tailwindcss"; @source "./**/*.vue"; @theme { --color-sub: blue; } .sub-card{}',
    }
    const subOther = {
      file: 'other/pages/index.css',
      source: '@import "tailwindcss"; @source "./**/*.vue"; .other-card{}',
    }
    const empty = { file: 'plain.css', source: '.plain{}' }

    const fingerprint = collectTailwindV4SourceFingerprint(`${main.source} @source not "./legacy"; @plugin '@iconify/tailwind4' { prefix: 'i'; scale: 1.2; } @custom-variant hocus { &:hover { @slot; } } @utility content-auto { content-visibility:auto; }`)
    expect([...fingerprint]).toContain('config:tailwind.config.js')
    expect([...fingerprint]).toContain('source:not:./legacy')
    expect([...fingerprint]).toContain('plugin:@iconify/tailwind4')
    expect([...fingerprint]).toContain('plugin-option:@iconify/tailwind4:prefix:\'i\'')
    expect([...fingerprint]).toContain('plugin-option:@iconify/tailwind4:scale:1.2')
    const iconifyOptionFingerprint = collectTailwindV4SourceFingerprint([
      "@plugin '@iconify/tailwind4' {",
      '  prefixes: tst;',
      '  icon-selector: ".ic-{prefix}-{name}";',
      '  mask-selector: ".mask-icon";',
      '  background-selector: ".bg-icon";',
      '  var-name: "icon";',
      '  square: false;',
      '  icon-sets: from-json(tst, "./icons.json");',
      '}',
    ].join('\n'))
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:prefixes:tst')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:icon-selector:".ic-{prefix}-{name}"')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:mask-selector:".mask-icon"')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:background-selector:".bg-icon"')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:var-name:"icon"')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:square:false')
    expect([...iconifyOptionFingerprint]).toContain('plugin-option:@iconify/tailwind4:icon-sets:from-json(tst, "./icons.json")')
    expect([...fingerprint]).toContain('custom-variant:hocus')
    expect([...fingerprint]).toContain('directive:content-auto')
    expect(scoreConfiguredTailwindV4SourceForRawSource(undefined, main.source)).toBe(0)
    expect(scoreConfiguredTailwindV4SourceForRawSource('.none{}', main.source)).toBe(0)
    expect(scoreConfiguredTailwindV4SourceForRawSource(main.source, main.source)).toBeGreaterThan(100)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [empty])).toBeUndefined()
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main])).toBe(main)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main, empty], undefined)).toBe(main)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main, sub], main.source)).toBe(main)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main, sub], `${main.source}\n${sub.source}`)).toBe(main)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main, sub], undefined, new Set(['sub']))).toBe(main)
    expect(selectTailwindV4GenerationCssSourceForOutput('sub/pages/index.wxss', [main, sub], undefined, new Set(['sub']))).toBe(sub)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [mainImplicit, mainExplicit], undefined)).toBe(mainExplicit)
    expect(selectTailwindV4GenerationCssSourceForOutput('sub/pages/index.wxss', [sub, subOther], undefined, new Set(['sub']))).toBe(sub)
    expect(selectTailwindV4GenerationCssSourceForOutput('other/pages/index.wxss', [sub, subOther], undefined, new Set(['sub', 'other']))).toBe(subOther)
    expect(selectTailwindV4GenerationCssSourceForOutput('sub/pages/index.wxss', [sub, subOther], subOther.source, new Set(['sub', 'other']))).toBe(subOther)
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [main, sub], '@import "tailwindcss";')).toBeUndefined()
    expect(selectTailwindV4GenerationCssSourceForOutput('app.wxss', [mainImplicit, subOther], undefined)).toBe(subOther)
    expect(resolveSubpackageRootForFile('sub/pages/index.wxss', new Set(['sub']))).toBe('sub')
    expect(resolveSubpackageRootForFile('pages/index.wxss', new Set(['sub']))).toBeUndefined()
    expect(resolveSubpackageRootForFile(undefined, new Set(['sub']))).toBeUndefined()
    expect(resolveSubpackageRootForFile('sub/pages/index.wxss', undefined)).toBeUndefined()
    expect(isSameSubpackageScope('sub/pages/index.wxss', 'sub/pages/index.css', new Set(['sub']))).toBe(true)
    expect(isSameSubpackageScope('app.wxss', 'sub/pages/index.css', new Set(['sub']))).toBe(false)
    expect(isSameSubpackageScope('app.wxss', undefined, new Set(['sub']))).toBe(true)
  })

  it('resolves temporary root css assets to remaining scoped Tailwind v4 css entries', () => {
    const resolver = createTemporaryCssAssetSourceResolver([
      {
        file: '/repo/src/app.css',
        outputFile: 'app-origin.acss',
        source: '@import "tailwindcss"; @source "./pages/**/*.tsx";',
      },
      {
        file: '/repo/src/sub-normal/pages/index.css',
        outputFile: 'sub-normal/pages/index.acss',
        source: '@import "tailwindcss"; @source "./**/*.tsx";',
      },
      {
        file: '/repo/src/sub-independent/pages/index.css',
        outputFile: 'sub-independent/pages/index.acss',
        source: '@import "tailwindcss"; @source "./**/*.tsx";',
      },
    ])

    expect(isTemporaryCssAssetFile('index.css')).toBe(true)
    expect(isTemporaryCssAssetFile('pages/index.css')).toBe(false)
    expect(isTemporaryCssAssetFile('app.acss')).toBe(false)

    resolver.markUsed('/repo/src/sub-normal/pages/index.css')

    expect(resolver.resolve('index.css')).toEqual({
      outputFile: 'sub-independent/pages/index.acss',
      rawSource: '@import "tailwindcss"; @source "./**/*.tsx";',
      sourceFile: '/repo/src/sub-independent/pages/index.css',
    })
    expect(resolver.resolve('index2.css')).toBeUndefined()

    const outOfOrderResolver = createTemporaryCssAssetSourceResolver([
      {
        file: '/repo/src/pages/index/index.css',
        outputFile: 'pages/index/index.acss',
        source: '@import "tailwindcss"; @source "./index.css"; .issue-951-page-local { color: #111827; }',
      },
      {
        file: '/repo/src/sub-normal/pages/index.css',
        outputFile: 'sub-normal/pages/index.acss',
        source: '@import "tailwindcss"; @source "./index.css"; .issue-951-normal-local { color: #7c3aed; }',
      },
      {
        file: '/repo/src/sub-independent/pages/index.css',
        outputFile: 'sub-independent/pages/index.acss',
        source: '@import "tailwindcss"; @source "./index.css"; .issue-951-independent-local { color: #059669; }',
      },
    ])
    expect(outOfOrderResolver.resolve('index.css', '.issue-951-independent-local{color:#059669}')).toEqual({
      outputFile: 'sub-independent/pages/index.acss',
      rawSource: '@import "tailwindcss"; @source "./index.css"; .issue-951-independent-local { color: #059669; }',
      sourceFile: '/repo/src/sub-independent/pages/index.css',
    })
    expect(outOfOrderResolver.resolve('index2.css', '.issue-951-page-local{color:#111827}')).toEqual({
      outputFile: 'pages/index/index.acss',
      rawSource: '@import "tailwindcss"; @source "./index.css"; .issue-951-page-local { color: #111827; }',
      sourceFile: '/repo/src/pages/index/index.css',
    })
  })

  it('resolves matched css outputs and applies css results back to bundle assets', () => {
    const opts = {
      appType: 'taro',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      platform: 'weapp',
    } as any
    expect(resolveCssBundleOutputFile({
      bundleFiles: ['app.wxss'],
      defaultStyleOutputExtension: '.wxss',
      file: 'app.scss',
      isWebGeneratorTarget: false,
      opts,
      shouldPreserveAppCssExtension: false,
    })).toBe('app.wxss')
    expect(resolveCssBundleOutputFile({
      bundleFiles: ['app.wxss'],
      defaultStyleOutputExtension: '.wxss',
      file: 'app.wxss',
      isWebGeneratorTarget: false,
      opts,
      shouldPreserveAppCssExtension: false,
    })).toBe('app-origin.wxss')
    expect(resolveOutputFileFromMatchedCssSource({
      bundleFiles: ['pages/index.wxss'],
      defaultStyleOutputExtension: '.wxss',
      isWebGeneratorTarget: false,
      opts,
      rootDir: '/repo',
      shouldPreserveAppCssExtension: false,
      sourceFile: undefined,
    })).toBeUndefined()
    expect(resolveOutputFileFromMatchedCssSource({
      bundleFiles: ['pages/index.wxss'],
      defaultStyleOutputExtension: '.wxss',
      isWebGeneratorTarget: false,
      opts,
      rootDir: '/repo',
      shouldPreserveAppCssExtension: false,
      sourceFile: '/repo/src/pages/index.scss',
      sourceRoot: '/repo/src',
    })).toBe('pages/index.wxss')
    expect(resolveOutputFileFromMatchedCssSource({
      bundleFiles: ['pages/index.css'],
      defaultStyleOutputExtension: '.css',
      isWebGeneratorTarget: true,
      opts,
      rootDir: '/repo',
      shouldPreserveAppCssExtension: false,
      sourceFile: '/repo/src/pages/index.scss',
      sourceRoot: '/repo/src',
    })).toBeUndefined()
    expect(shouldSkipRawSourceStyleAsset('app.wxss', 'app.wxss', '.a{}')).toBe(false)
    expect(shouldSkipRawSourceStyleAsset('app.wxss', 'app.scss', '')).toBe(false)
    expect(shouldSkipRawSourceStyleAsset('app.wxss', 'app.scss', 'div { color: red; }')).toBe(false)
    expect(shouldSkipRawSourceStyleAsset('app.wxss', 'app.scss', '$color: red; .a { color: $color; }')).toBe(true)
    expect(shouldSkipRawSourceStyleAsset('pages/index.wxss', 'pages/index.wxss', '<template><view>// marker</view></template>', '/repo/src/pages/index.vue')).toBe(true)
    expect(shouldSkipRawSourceStyleAsset('pages/index.wxss', 'pages/index.wxss', '$color: red; .a { color: $color; }', '/repo/src/pages/index.wxss', file => file.endsWith('.wxss'))).toBe(false)
    const sfcSourceVariants = {
      vue: [
        '/repo/src/pages/index.vue',
        '/repo/src/pages/index.vue?vue&type=template&id=abc&lang.ts',
        '/repo/src/pages/index.vue?vue&lang.ts&type=template&id=abc',
        '/repo/src/pages/index.vue?vue&type=template&id=abc&lang=ts',
        '/repo/src/pages/index.vue?vue&type=template&id=abc&ts=true',
        '/repo/src/pages/index.vue?vue&type=script&setup=true&lang.ts',
      ],
      nvue: [
        '/repo/src/pages/index.nvue',
        '/repo/src/pages/index.nvue?vue&type=template&id=abc&lang.ts',
        '/repo/src/pages/index.nvue?vue&lang.ts&type=template&id=abc',
        '/repo/src/pages/index.nvue?vue&type=template&id=abc&lang=ts',
        '/repo/src/pages/index.nvue?vue&type=template&id=abc&ts=true',
        '/repo/src/pages/index.nvue?vue&type=script&setup=true&lang.ts',
      ],
      uvue: [
        '/repo/src/pages/index.uvue',
        '/repo/src/pages/index.uvue?vue&type=template&id=abc&lang.uts',
        '/repo/src/pages/index.uvue?vue&lang.uts&type=template&id=abc',
        '/repo/src/pages/index.uvue?vue&type=template&id=abc&lang=uts',
        '/repo/src/pages/index.uvue?vue&type=template&id=abc&ts=true',
        '/repo/src/pages/index.uvue?vue&type=script&setup=true&lang.uts',
      ],
    } as const
    const miniProgramStyleOutputs = ['wxss', 'acss', 'ttss', 'qss'] as const
    for (const sourceFiles of Object.values(sfcSourceVariants)) {
      for (const sourceFile of sourceFiles) {
        for (const extension of miniProgramStyleOutputs) {
          const outputFile = `pages/index.${extension}`
          expect(shouldSkipRawSourceStyleAsset(outputFile, outputFile, '<template><view>// marker</view></template>', sourceFile), sourceFile).toBe(true)
        }
      }
    }
    const styleSourceAssets = [
      ['/repo/src/pages/index.vue?vue&type=style&index=0&lang.scss', 'pages/index.wxss'],
      ['/repo/src/pages/index.vue?vue&type=style&index=0&lang=scss&scoped=true', 'pages/index.wxss'],
      ['/repo/src/pages/index.vue?vue&type=style&index=0&lang.css#hash', 'pages/index.wxss'],
      ['/repo/src/pages/index.vue?vue&type=styles&index=0&lang=css', 'pages/index.wxss'],
      ['/repo/src/pages/index.nvue?vue&type=style&index=0&lang.css', 'pages/index.wxss'],
      ['/repo/src/pages/index.nvue?vue&type=style&index=0&lang=css#hash', 'pages/index.wxss'],
      ['/repo/src/pages/index.uvue?vue&type=style&index=0&lang.scss', 'pages/index.wxss'],
      ['/repo/src/pages/index.uvue?vue&type=style&index=0&inline&lang.css', 'pages/index.wxss'],
      ['/repo/src/pages/index.wxss', 'pages/index.wxss'],
      ['/repo/src/pages/index.acss', 'pages/index.acss'],
    ] as const
    for (const [sourceFile, outputFile] of styleSourceAssets) {
      expect(shouldSkipRawSourceStyleAsset(outputFile, outputFile, '$color: red; .a { color: $color; }', sourceFile, file => /\.(?:wxss|acss|ttss|qss)$/.test(file)), sourceFile).toBe(false)
    }

    const fallback = vi.fn((sourceFile?: string) => sourceFile ? `out/${sourceFile}` : undefined)
    const resolve = createMatchedCssSourceOutputResolver({
      assetSourceFile: '/repo/src/app.css',
      file: 'app.wxss',
      originalFileNames: ['/repo/src/aliased.css'],
      resolveOutputFileFromMatchedCssSource: fallback,
    })
    expect(resolve(undefined)).toBeUndefined()
    expect(resolve('/repo/src/app.css?direct')).toBe('app.wxss')
    expect(resolve('/repo/src/aliased.css')).toBe('app.wxss')
    expect(resolve('pages/index.css')).toBe('out/pages/index.css')
    const resolveMisplacedSameBasenameCss = createMatchedCssSourceOutputResolver({
      assetSourceFile: '/repo/src/pages/index/index.css',
      file: 'sub-independent/pages/index.ttss',
      resolveOutputFileFromMatchedCssSource: sourceFile =>
        sourceFile === '/repo/src/pages/index/index.css'
          ? 'pages/index/index.ttss'
          : undefined,
    })
    expect(resolveMisplacedSameBasenameCss('/repo/src/pages/index/index.css')).toBe('pages/index/index.ttss')
    expect(hasViteProcessedCssResultForSource('app.wxss', () => new Map([['app.wxss', {}]]))).toBe(true)
    expect(hasViteProcessedCssResultForSource('app.wxss', () => new Map([['pages/app.wxss', {}]]))).toBe(false)
    expect(hasViteProcessedCssResultForSource('app.wxss')).toBe(false)

    const same = createAsset('old')
    applyCssResultToBundle({
      appType: 'native',
      assetSourceFile: '/repo/src/app.css',
      bundle: { 'app.wxss': same },
      emitOrReplayCssAsset: vi.fn(),
      file: 'app.wxss',
      originalSource: same,
      outputFile: 'app.wxss',
      source: 'new',
      viteProcessedCssAsset: false,
    })
    expect(same.source).toBe('new')

    const original = createAsset('old', ['/repo/src/app.css'])
    const existing = createAsset('existing')
    applyCssResultToBundle({
      appType: 'uni-app-vite',
      assetSourceFile: '/repo/src/app.css',
      bundle: { 'app.wxss': original, 'app-origin.wxss': existing },
      emitOrReplayCssAsset: vi.fn(),
      file: 'app.wxss',
      originalSource: original,
      outputFile: 'app-origin.wxss',
      source: 'generated',
      viteProcessedCssAsset: false,
    })
    expect(existing.source).toBe('generated')
    expect(original.source).toBe('@import "./app-origin.wxss";\n')

    const emittedOrigin = createAsset('old', ['/repo/src/app.css'])
    const emitOrigin = vi.fn()
    applyCssResultToBundle({
      appType: 'uni-app-vite',
      assetSourceFile: '/repo/src/app.css',
      bundle: { 'app.wxss': emittedOrigin },
      emitOrReplayCssAsset: emitOrigin,
      file: 'app.wxss',
      originalSource: emittedOrigin,
      outputFile: 'app-origin.wxss',
      source: 'generated',
      viteProcessedCssAsset: false,
    })
    expect(emitOrigin).toHaveBeenCalledWith('app-origin.wxss', 'generated')
    expect(emittedOrigin.source).toBe('@import "./app-origin.wxss";\n')

    const originalNoShell = createAsset('old', ['/repo/src/app.css'])
    const existingNoShell = createAsset('existing')
    applyCssResultToBundle({
      appType: 'native',
      assetSourceFile: '/repo/src/app.css',
      bundle: { 'app.wxss': originalNoShell, 'app-origin.wxss': existingNoShell },
      emitOrReplayCssAsset: vi.fn(),
      file: 'app.wxss',
      originalSource: originalNoShell,
      outputFile: 'app-origin.wxss',
      source: 'generated',
      viteProcessedCssAsset: false,
    })
    expect(existingNoShell.source).toBe('generated')
    expect(originalNoShell.source).toBe('')

    const secondOriginal = createAsset('old')
    const secondExisting = createAsset('existing')
    applyCssResultToBundle({
      appType: 'native',
      assetSourceFile: '/repo/src/pages/index.css',
      bundle: { 'pages/index.wxss': secondOriginal, 'pages/index.css': secondExisting },
      emitOrReplayCssAsset: vi.fn(),
      file: 'pages/index.wxss',
      originalSource: secondOriginal,
      outputFile: 'pages/index.css',
      source: 'generated',
      viteProcessedCssAsset: true,
    })
    expect(secondExisting.source).toBe('generated')
    expect(secondOriginal.source).toBe('')

    const emitted = createAsset('old')
    const emitOrReplayCssAsset = vi.fn()
    const bundle = { 'pages/index.scss': emitted }
    applyCssResultToBundle({
      appType: 'native',
      assetSourceFile: '/repo/src/pages/index.css',
      bundle,
      emitOrReplayCssAsset,
      file: 'pages/index.scss',
      originalSource: emitted,
      outputFile: 'pages/index.css',
      source: 'generated',
      viteProcessedCssAsset: false,
    })
    expect(emitOrReplayCssAsset).toHaveBeenCalledWith('pages/index.css', 'generated')
    expect(bundle['pages/index.scss']).toBeUndefined()

    const kept = createAsset('old')
    applyCssResultToBundle({
      appType: 'native',
      assetSourceFile: '/repo/src/pages/index.css',
      bundle: { 'pages/index.wxss': kept },
      emitOrReplayCssAsset: vi.fn(),
      file: 'pages/index.wxss',
      originalSource: kept,
      outputFile: 'pages/index.css',
      source: 'generated',
      viteProcessedCssAsset: true,
    })
    expect(kept.source).toBe('')
  })
})
