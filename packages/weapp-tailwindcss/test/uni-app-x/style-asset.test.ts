import type { OutputAsset, OutputChunk } from 'rollup'
import { describe, expect, it } from 'vitest'
import {
  collectUniAppXHarmonyApplyStyleSources,
  collectUniAppXHarmonyApplyUtilities,
  createUniAppXBundleAssetSourceGetter,
  createUniAppXHarmonyApplyGeneratorSource,
  injectUniAppXHarmonyBundleStyles,
  injectUniAppXHarmonyGlobalStyles,
  injectUniAppXStylePlaceholder,
  isUniAppXHarmonyBundle,
} from '@/uni-app-x/style-asset'
import {
  collectChunkMapSourcesContent,
  collectUniAppXHarmonyApplyStyleSourcesFromSource,
  collectUniAppXHarmonyApplyUtilitiesFromSources,
  createMergedStyleValue,
  createStyleValueFromApplySources,
  createUtsStyleArrayFromAppStyles,
  cssSourceToStyleValue,
  mergeStyleValues,
  parseSourceMapSourcesContent,
  parseStyleExport,
  parseStyleObject,
  styleExportToUtsMap,
} from '@/uni-app-x/style-asset/style-value'

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

function chunk(fileName: string, code: string, extra: Partial<OutputChunk> = {}): OutputChunk {
  return {
    type: 'chunk',
    fileName,
    code,
    name: fileName,
    isEntry: false,
    isDynamicEntry: false,
    facadeModuleId: null,
    moduleIds: [],
    imports: [],
    dynamicImports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    referencedFiles: [],
    exports: [],
    modules: {},
    preliminaryFileName: fileName,
    sourcemapFileName: null,
    ...extra,
  }
}

const componentCode = [
  'const _style_0 = {"base":{"":{color:"red"}}};',
  'const _sfc_main = { class: "app page green" };',
  'export default _export_sfc(_sfc_main, [["__file","pages/index.uvue"]]);',
].join('\n')

describe('uni-app-x style asset helpers', () => {
  it('detects harmony bundles and reads bundle sources by suffix', () => {
    const bundle = {
      'assets/App.js': chunk('assets/App.js', 'app-code'),
      'import/app-service.ets': asset('import/app-service.ets', 'marker'),
    }
    const getSource = createUniAppXBundleAssetSourceGetter(bundle)

    expect(isUniAppXHarmonyBundle(bundle)).toBe(true)
    expect(isUniAppXHarmonyBundle({})).toBe(false)
    expect(getSource('App.js')).toBe('app-code')
    expect(getSource('missing.js')).toBeUndefined()
  })

  it('creates generator source from apply style sources', () => {
    expect(createUniAppXHarmonyApplyGeneratorSource(['.a{@apply flex}', '.b{@apply block}'], ['flex'])).toBe('.a{@apply flex}\n.b{@apply block}')
    expect(createUniAppXHarmonyApplyGeneratorSource([
      '@reference "../../main.css"; .a{@apply flex}',
      '@reference "/project/main.css"; .b{@apply block}',
    ], ['flex', 'block'])).toBe('.a{@apply flex}\n@reference "/project/main.css"; .b{@apply block}')
  })

  it('resolves apply references against the original uvue module', () => {
    expect(collectUniAppXHarmonyApplyStyleSourcesFromSource(`
<style scoped>
@reference "../../main.css";
.card { @apply px-4; }
</style>
`, '/project/pages/index/index.uvue')).toEqual([
      '@reference "/project/main.css";\n.card { @apply px-4; }',
    ])
  })

  it('injects style placeholders from app styles or fallback css assets', () => {
    const appCode = 'const GenAppStyles = [];\nAppStyles = [{"base":{"":{color:"red"}}}]'
    expect(injectUniAppXStylePlaceholder('pages/index.uvue.ts', 'const GenPageStyles = []', file => file === 'App.uvue.ts' ? appCode : undefined)).toContain('GenPageStyles')
    expect(injectUniAppXStylePlaceholder('pages/index.js', 'const GenPageStyles = []')).toBe('const GenPageStyles = []')
    expect(injectUniAppXStylePlaceholder('pages/index.uvue.ts', 'const GenPageStyles = []', file => file === 'pages/index.uvue' ? '.text{color:red}' : undefined)).toContain('color')
    expect(injectUniAppXStylePlaceholder('pages/index.uvue.ts', 'const GenPageStyles = []', () => undefined)).toBe('const GenPageStyles = []')
  })

  it('injects global styles into chunks and preserves unsupported files', () => {
    expect(injectUniAppXHarmonyGlobalStyles('App.js', componentCode, () => '.root{color:red}')).toBe(componentCode)
    expect(injectUniAppXHarmonyGlobalStyles('components/button.js', componentCode, () => '.root{color:red}', { excludeComponents: true })).toBe(componentCode)

    const next = injectUniAppXHarmonyGlobalStyles('pages/index.js', [
      'const _sfc_main = { class: "green" };',
      'export default _export_sfc(_sfc_main, [["__file","pages/index.uvue"]]);',
    ].join('\n'), file => file === 'App.js' ? 'const _style_0 = {"base":{"":{color:"blue"}}};' : undefined, {
      cssSources: ['.green{color:green}'],
    })

    expect(next).toContain('const _style_wt =')
    expect(next).toContain('["styles", [_style_wt]]')
    expect(next).toContain('green')
  })

  it('collects apply sources from uvue assets, chunks, and sourcemaps', () => {
    const map = JSON.stringify({
      version: 3,
      sourcesContent: ['.from-map{@apply flex}'],
    })
    const bundle = {
      'pages/index.uvue': asset('pages/index.uvue', '.from-asset{@apply block}'),
      'pages/index.js': chunk('pages/index.js', '', {
        map: {
          version: 3,
          mappings: '',
          sources: [],
          names: [],
          sourcesContent: ['.from-chunk{@apply grid}'],
        } as any,
      }),
      'pages/index.js.map': asset('pages/index.js.map', map),
      'App.js': chunk('App.js', '.ignored{@apply hidden}'),
    }

    expect(collectUniAppXHarmonyApplyStyleSources(bundle)).toEqual(expect.arrayContaining([
      '.from-asset{@apply block}',
      '.from-chunk{@apply grid}',
      '.from-map{@apply flex}',
    ]))
    expect([...collectUniAppXHarmonyApplyUtilities(bundle)]).toEqual(expect.arrayContaining(['grid', 'flex']))
  })

  it('injects bundle styles from imported css metadata', () => {
    const bundle = {
      'assets/App.js': chunk('assets/App.js', 'const _style_0 = {"base":{"":{color:"blue"}}};', {
        viteMetadata: { importedCss: new Set(['app.css']) },
      } as any),
      'pages/index.js': chunk('pages/index.js', [
        'const _sfc_main = { class: "app page" };',
        'export default _export_sfc(_sfc_main, [["__file","pages/index.uvue"]]);',
      ].join('\n'), {
        viteMetadata: { importedCss: new Set(['page.css']) },
      } as any),
      'app.css': asset('app.css', '.app{color:blue}'),
      'page.css': asset('page.css', '.page{color:green}'),
    }

    expect(injectUniAppXHarmonyBundleStyles(bundle)).toBe(true)
    expect(bundle['pages/index.js'].code).toContain('page')
    expect(bundle['pages/index.js'].code).toContain('app')
  })

  it('parses style values and handles empty or malformed sources conservatively', () => {
    expect(parseStyleExport('')).toBeUndefined()
    expect(parseStyleExport('export default {"btn":{"":{"font-size":"12px","color":"rgb(1, 2, 3)"}}}')).toEqual({
      btn: { '': { 'font-size': '12px', color: 'rgb(1, 2, 3)' } },
    })
    expect(parseStyleExport('export default {')).toBeUndefined()
    expect(parseStyleObject('{')).toBeUndefined()
    expect(parseSourceMapSourcesContent('{')).toEqual([])
    expect(parseSourceMapSourcesContent(JSON.stringify({ sourcesContent: ['.a{}', 1] }))).toEqual(['.a{}'])
    expect(collectChunkMapSourcesContent(chunk('empty.js', '', { map: null }))).toEqual([])
    expect(collectChunkMapSourcesContent(chunk('mapped.js', '', {
      map: { sourcesContent: ['.a{}', false] } as any,
    }))).toEqual(['.a{}'])

    expect(styleExportToUtsMap({ empty: { '': {} } })).toBe('[]')
    expect(styleExportToUtsMap({
      btn: { '': { 'font-size': '12px', color: 'rgb(1, 2, 3)' } },
    })).toContain('"fontSize", 12')
  })

  it('creates and merges style values from css, app styles, and apply sources', () => {
    const utilityStyles = cssSourceToStyleValue('.flex{display:flex}.w-\\[12px\\]{width:12px}')!
    expect(cssSourceToStyleValue('.broken{')).toBeUndefined()
    expect(utilityStyles.flex['']).toMatchObject({ display: 'flex' })
    expect(utilityStyles['w-[12px]']['']).toMatchObject({ width: 12 })
    expect(mergeStyleValues(undefined, { local: { '': { color: 'red' } } })?.local[''].color).toBe('red')

    const appSource = 'const GenAppStyles = [_uM([["app", _pS(_uM([["color", "red"]]))], ["unused", _pS(_uM([["color", "blue"]]))]])]'
    expect(createUtsStyleArrayFromAppStyles('const cls = "app"', appSource)).toContain('"app"')
    expect(createUtsStyleArrayFromAppStyles('const cls = "none"', appSource)).toBeUndefined()
    expect(createUtsStyleArrayFromAppStyles('const cls = "app"')).toBeUndefined()

    const applied = createStyleValueFromApplySources([
      '<template></template><style>.card{@apply flex w-[12px]}</style>',
      '.broken{',
      '.plain{color:red}',
    ], utilityStyles)
    expect(applied?.card['']).toMatchObject({ display: 'flex', width: 12 })
    expect(createStyleValueFromApplySources(['.card{@apply flex}'], undefined)).toBeUndefined()

    expect(collectUniAppXHarmonyApplyStyleSourcesFromSource('<style>.a{@apply flex}</style><style>.b{color:red}</style>')).toEqual(['.a{@apply flex}'])
    expect([...collectUniAppXHarmonyApplyUtilitiesFromSources(['.a{@apply flex block}', '.broken{'])]).toEqual(['flex', 'block'])
    expect(createMergedStyleValue('const cls = "app"', undefined, { app: { '': { color: 'red' } } })?.app[''].color).toBe('red')
    expect(createMergedStyleValue('const cls = "app"', { app: { '': { color: 'blue' } } }, { app: { '': { color: 'red' } } })).toBeUndefined()
    expect(createMergedStyleValue('const cls = "none"', undefined, { app: { '': { color: 'red' } } })).toBeUndefined()
  })
})
