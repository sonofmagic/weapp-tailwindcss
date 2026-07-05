import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

describe('framework plugin composition profiles', () => {
  afterEach(() => {
    vi.doUnmock('@/bundlers/vite/shared/create-framework-plugins')
    vi.doUnmock('@/bundlers/webpack/shared/create-framework-plugin')
    vi.doUnmock('@/bundlers/gulp/shared/create-native-framework-plugins')
    vi.resetModules()
  })

  it('routes Vite public entry to framework factories', async () => {
    vi.doMock('@/bundlers/vite/shared/create-framework-plugins', () => ({
      createViteFrameworkPlugins: vi.fn((_options, framework) => [{ name: framework.frameworkName }]),
    }))

    const { WeappTailwindcss } = await import('@/bundlers/vite')

    expect(WeappTailwindcss({ appType: 'taro' })?.map(plugin => plugin.name)).toEqual([
      'weapp-tailwindcss:taro-alipay-browserslist-asset',
      'taro',
    ])
    expect(WeappTailwindcss({ appType: 'uni-app-vite' })?.[0]?.name).toBe('uni-app')
    expect(WeappTailwindcss({ appType: 'uni-app-x' })?.[0]?.name).toBe('uni-app-x')
    expect(WeappTailwindcss({ appType: 'weapp-vite' })?.[0]?.name).toBe('weapp-vite')
  })

  it('pre-registers Taro Alipay browserslist asset inside the Vite bundle graph', async () => {
    const { WeappTailwindcss } = await import('@/bundlers/vite')
    const plugins = WeappTailwindcss({ appType: 'taro' }) ?? []
    const browserslistAssetPlugin = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:taro-alipay-browserslist-asset')

    expect(browserslistAssetPlugin?.enforce).toBe('pre')
    expect(plugins.some(plugin => plugin.name === 'weapp-tailwindcss:taro-cjs-stability')).toBe(false)

    const previousTaroEnv = process.env.TARO_ENV
    try {
      delete process.env.TARO_ENV
      const weappBundle = {}
      await (browserslistAssetPlugin?.generateBundle as any)?.({}, weappBundle)
      expect(weappBundle).not.toHaveProperty('.browserslistrc')

      process.env.TARO_ENV = 'alipay'
      const alipayBundle = {}
      await (browserslistAssetPlugin?.generateBundle as any)?.({}, alipayBundle)
      expect(alipayBundle).toMatchObject({
        '.browserslistrc': {
          type: 'asset',
          fileName: '.browserslistrc',
          source: 'defaults and fully supports es6-module',
        },
      })
    }
    finally {
      if (previousTaroEnv === undefined) {
        delete process.env.TARO_ENV
      }
      else {
        process.env.TARO_ENV = previousTaroEnv
      }
    }
  })

  it('keeps uni-app-x Vite plugin composition inside its framework branch', async () => {
    const root = path.resolve(__dirname, '../..')
    const sharedSource = await readFile(
      path.join(root, 'src/bundlers/vite/shared/create-framework-plugins.ts'),
      'utf8',
    )
    const generateBundleSource = await readFile(
      path.join(root, 'src/bundlers/vite/generate-bundle.ts'),
      'utf8',
    )
    const cssFinalizerSource = await readFile(
      path.join(root, 'src/bundlers/vite/css-finalizer.ts'),
      'utf8',
    )
    const processedCssAssetsSource = await readFile(
      path.join(root, 'src/bundlers/vite/processed-css-assets.ts'),
      'utf8',
    )
    const uniAppXSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/uni-app-x/index.ts'),
      'utf8',
    )

    expect(sharedSource).not.toContain("from '@/uni-app-x/vite'")
    expect(sharedSource).not.toContain("from '@/uni-app-x/")
    expect(sharedSource).not.toContain("frameworkName === 'uni-app-x'")
    expect(sharedSource).not.toContain("opts.appType === 'uni-app-x'")
    expect(sharedSource).not.toContain("opts.appType === 'uni-app-vite'")
    expect(generateBundleSource).not.toContain("from '@/uni-app-x/")
    expect(generateBundleSource).not.toContain("opts.appType === 'uni-app-x'")
    expect(generateBundleSource).not.toContain("opts.appType === 'uni-app-vite'")
    expect(cssFinalizerSource).not.toContain("opts.appType === 'uni-app-x'")
    expect(cssFinalizerSource).not.toContain("opts.appType === 'uni-app-vite'")
    expect(processedCssAssetsSource).not.toContain("opts.appType === 'uni-app-x'")
    expect(processedCssAssetsSource).not.toContain("opts.appType === 'uni-app-vite'")
    expect(sharedSource).toContain('cssPipelineStrategy')
    expect(generateBundleSource).toContain('cssPipelineStrategy')
    expect(cssFinalizerSource).toContain('cssPipelineStrategy')
    expect(processedCssAssetsSource).toContain('cssPipelineStrategy')
    expect(uniAppXSource).toContain("from '@/uni-app-x/vite'")
    expect(uniAppXSource).toContain('uniAppXCssPipelineStrategy')
    expect(uniAppXSource).toContain('resolveUniAppXNativeCssHandlerOptions')
    expect(uniAppXSource).toContain('withUniAppXWebPreflightReset')
    expect(uniAppXSource).toContain('isUniAppXHarmonyBundle')
    expect(uniAppXSource).toContain('isRuntimeClassSetFeatureEnabled: () => true')
  })

  it('keeps uni-app Vite webview css strategy inside its framework branch', async () => {
    const root = path.resolve(__dirname, '../..')
    const sharedSource = await readFile(
      path.join(root, 'src/bundlers/vite/shared/create-framework-plugins.ts'),
      'utf8',
    )
    const generateBundleSource = await readFile(
      path.join(root, 'src/bundlers/vite/generate-bundle.ts'),
      'utf8',
    )
    const uniAppSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/uni-app/index.ts'),
      'utf8',
    )
    const taroSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/taro/index.ts'),
      'utf8',
    )

    expect(sharedSource).not.toContain('isUniAppViteWebviewStylePlatform')
    expect(sharedSource).not.toContain('transformWebCssSafeSelectors')
    expect(generateBundleSource).not.toContain('transformWebCssSafeSelectors')
    expect(uniAppSource).toContain('uniAppCssPipelineStrategy')
    expect(uniAppSource).toContain('transformWebCssSafeSelectors')
    expect(uniAppSource).toContain('needEscaped: true')
    expect(uniAppSource).toContain('shouldApplyFinalWebviewCssCompat')
    expect(uniAppSource).toContain('resolveConfiguredCssEntryRootInjectionTarget')
    expect(taroSource).not.toContain('transformWebCssSafeSelectors')
    expect(taroSource).not.toContain('needEscaped: true')
  })

  it('keeps Vite style injector delegate selection inside framework branches', async () => {
    const root = path.resolve(__dirname, '../..')
    const sharedSource = await readFile(
      path.join(root, 'src/bundlers/vite/shared/create-framework-plugins.ts'),
      'utf8',
    )
    const genericSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/generic/index.ts'),
      'utf8',
    )
    const taroSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/taro/index.ts'),
      'utf8',
    )
    const uniAppSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/uni-app/index.ts'),
      'utf8',
    )
    const uniAppXSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/uni-app-x/index.ts'),
      'utf8',
    )

    expect(sharedSource).not.toContain('resolveViteStyleInjectorDelegate')
    expect(sharedSource).not.toContain('viteStyleInjectorDelegates.')
    expect(genericSource).toContain('viteStyleInjectorDelegates.generic')
    expect(taroSource).toContain('viteStyleInjectorDelegates.taro')
    expect(uniAppSource).toContain('viteStyleInjectorDelegates.uniApp')
    expect(uniAppXSource).toContain('viteStyleInjectorDelegates.uniApp')
    expect(taroSource).not.toContain("from '@/uni-app-x/vite'")
  })

  it('routes Webpack public class to framework classes', async () => {
    const appliedFrameworks: string[] = []

    vi.doMock('@/bundlers/webpack/shared/create-framework-plugin', () => ({
      weappTailwindcssPackageDir: '/mock/weapp-tailwindcss',
      WebpackFrameworkPlugin: class {
        appType: string | undefined
        options: Record<string, unknown>
        private frameworkName: string

        constructor(options: Record<string, unknown> = {}, framework: { frameworkName: string }) {
          this.options = options
          this.appType = options.appType as string | undefined
          this.frameworkName = framework.frameworkName
        }

        apply() {
          appliedFrameworks.push(this.frameworkName)
        }
      },
    }))

    const { WeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')

    new WeappTailwindcss({ appType: 'taro' }).apply({ options: {}, context: process.cwd() } as any)
    new WeappTailwindcss({ appType: 'mpx' }).apply({ options: {}, context: process.cwd() } as any)
    new WeappTailwindcss({ appType: 'uni-app' }).apply({ options: {}, context: process.cwd() } as any)

    expect(appliedFrameworks).toEqual([
      'taro',
      'mpx',
      'uni-app',
    ])
  })

  it('keeps Webpack mpx and style injector choices inside framework branches', async () => {
    const root = path.resolve(__dirname, '../..')
    const sharedSource = await readFile(
      path.join(root, 'src/bundlers/webpack/shared/create-framework-plugin.ts'),
      'utf8',
    )
    const loaderSource = await readFile(
      path.join(root, 'src/bundlers/webpack/BaseUnifiedPlugin/v5-loaders.ts'),
      'utf8',
    )
    const mpxSource = await readFile(
      path.join(root, 'src/bundlers/webpack/frameworks/mpx/index.ts'),
      'utf8',
    )
    const taroSource = await readFile(
      path.join(root, 'src/bundlers/webpack/frameworks/taro/index.ts'),
      'utf8',
    )
    const uniAppSource = await readFile(
      path.join(root, 'src/bundlers/webpack/frameworks/uni-app/index.ts'),
      'utf8',
    )

    expect(sharedSource).not.toContain('resolveWebpackStyleInjectorDelegate')
    expect(sharedSource).not.toContain('setupMpxTailwindcssRedirect')
    expect(sharedSource).not.toContain('isMpx(')
    expect(loaderSource).not.toContain('isMpx(')
    expect(mpxSource).toContain('setupMpxTailwindcssRedirect')
    expect(mpxSource).toContain('createMpxLoaderAnchorFinders')
    expect(mpxSource).toContain('webpackStyleInjectorDelegates.mpx')
    expect(taroSource).toContain('webpackStyleInjectorDelegates.taro')
    expect(uniAppSource).toContain('webpackStyleInjectorDelegates.uniApp')
    expect(taroSource).not.toContain('setupMpxTailwindcssRedirect')
    expect(uniAppSource).not.toContain('setupMpxTailwindcssRedirect')
  })

  it('routes Gulp public entry to native framework factory', async () => {
    vi.doMock('@/bundlers/gulp/shared/create-native-framework-plugins', () => ({
      createNativeGulpPlugins: vi.fn(options => [`native:${options.appType ?? 'native'}`]),
    }))

    const { createPlugins } = await import('@/bundlers/gulp')

    expect(createPlugins()).toEqual(['native:native'])
    expect(createPlugins({ appType: 'native' })).toEqual(['native:native'])
  })
})
