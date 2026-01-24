import type { Transform } from 'node:stream'
import type { Document, PluginCreator, Result as PostcssResult, Root } from 'postcss'
import type { Plugin as VitePlugin } from 'vite'
import type { Options as CssMacroOptions } from 'weapp-tailwindcss/css-macro'
import type { Options as PostcssCssMacroOptions } from 'weapp-tailwindcss/css-macro/postcss'
import type { IOptions as HtmlTransformOptions } from 'weapp-tailwindcss/postcss-html-transform'
import type { BasePresetOptions, UniAppPresetOptions, UniAppXOptions } from 'weapp-tailwindcss/presets'
import type {
  AppType,
  CreateJsHandlerOptions,
  IStyleHandlerOptions,
  ITemplateHandlerOptions,
  JsHandlerResult,
  UserDefinedOptions,
} from 'weapp-tailwindcss/types'
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from 'tsd'
import {
  createPlugins as createGulpPlugins,
  UnifiedViteWeappTailwindcssPlugin,
  UnifiedWebpackPluginV5,
} from 'weapp-tailwindcss'
import { createContext } from 'weapp-tailwindcss/core'
import cssMacro from 'weapp-tailwindcss/css-macro'
import postcssCssMacro from 'weapp-tailwindcss/css-macro/postcss'
import { getDefaultOptions } from 'weapp-tailwindcss/defaults'
import { escape, isAllowedClassName, unescape, weappTwIgnore } from 'weapp-tailwindcss/escape'
import { createPlugins as createGulpPluginsEntry } from 'weapp-tailwindcss/gulp'
import postcssHtmlTransform from 'weapp-tailwindcss/postcss-html-transform'
import {

  createBasePreset,
  normalizeCssEntries,
  uniApp,

  uniAppX,

} from 'weapp-tailwindcss/presets'
import reset, { reset as resetPlugin } from 'weapp-tailwindcss/reset'
import { UnifiedViteWeappTailwindcssPlugin as UnifiedViteEntry } from 'weapp-tailwindcss/vite'
import { UnifiedWebpackPluginV5 as UnifiedWebpackEntry } from 'weapp-tailwindcss/webpack'
import { UnifiedWebpackPluginV4 } from 'weapp-tailwindcss/webpack4'

expectAssignable<AppType>('taro')
expectNotAssignable<AppType>('unknown')

const userOptions: UserDefinedOptions = {
  appType: 'taro',
  cssMatcher: file => file.endsWith('.wxss'),
  htmlMatcher: file => file.endsWith('.wxml'),
  jsMatcher: file => file.endsWith('.js'),
  wxsMatcher: file => file.endsWith('.wxs'),
  mainCssChunkMatcher: (file, appType) => Boolean(file) && appType !== 'native',
}
expectAssignable<UserDefinedOptions>(userOptions)

const webpackPlugin = new UnifiedWebpackPluginV5(userOptions)
expectType<UnifiedWebpackPluginV5>(webpackPlugin)

const webpackEntryPlugin = new UnifiedWebpackEntry(userOptions)
expectType<UnifiedWebpackEntry>(webpackEntryPlugin)

const webpack4Plugin = new UnifiedWebpackPluginV4()
expectType<UnifiedWebpackPluginV4>(webpack4Plugin)

expectType<VitePlugin[] | undefined>(UnifiedViteWeappTailwindcssPlugin({ appType: 'uni-app' }))
expectType<VitePlugin[] | undefined>(UnifiedViteEntry({ appType: 'uni-app' }))

const gulpPlugins = createGulpPlugins({ appType: 'native' })
expectType<Transform>(gulpPlugins.transformWxss())
expectType<Transform>(gulpPlugins.transformJs({ filename: 'src/app.ts' }))
expectType<Transform>(gulpPlugins.transformWxml())

const gulpEntryPlugins = createGulpPluginsEntry({ appType: 'native' })
expectType<Transform>(gulpEntryPlugins.transformWxss())
expectType<Transform>(gulpEntryPlugins.transformJs())
expectType<Transform>(gulpEntryPlugins.transformWxml())

const jsHandlerOptions: CreateJsHandlerOptions = { filename: 'src/app.ts' }
expectAssignable<CreateJsHandlerOptions>(jsHandlerOptions)

const styleHandlerOptions: Partial<IStyleHandlerOptions> = { isMainChunk: true }
expectAssignable<Partial<IStyleHandlerOptions>>(styleHandlerOptions)

const templateHandlerOptions: Partial<ITemplateHandlerOptions> = { quote: '"' }
expectAssignable<Partial<ITemplateHandlerOptions>>(templateHandlerOptions)

const context = createContext({ appType: 'taro' })
expectType<Promise<PostcssResult<Root | Document>>>(context.transformWxss(''))
expectType<Promise<JsHandlerResult>>(context.transformJs('const foo = 1'))
expectType<Promise<string>>(context.transformWxml('<view class="foo"></view>'))

const defaults = getDefaultOptions()
expectAssignable<UserDefinedOptions>(defaults)

const basePresetOptions: BasePresetOptions = { base: '.', cssEntries: 'src/app.css' }
expectAssignable<BasePresetOptions>(basePresetOptions)
expectAssignable<Partial<UserDefinedOptions>>(createBasePreset(basePresetOptions))
expectType<string[] | undefined>(normalizeCssEntries('src/app.css'))

const uniAppPresetOptions: UniAppPresetOptions = {}
expectAssignable<UniAppPresetOptions>(uniAppPresetOptions)
expectAssignable<Partial<UserDefinedOptions>>(uniApp())

const uniAppXOptions: UniAppXOptions = { base: '.', cssEntries: ['src/app.css'] }
expectAssignable<UniAppXOptions>(uniAppXOptions)
expectAssignable<Partial<UserDefinedOptions>>(uniAppX(uniAppXOptions))

expectAssignable<CssMacroOptions>({
  dynamic: false,
  variantsMap: {
    ios: 'ios',
    android: { value: 'android', negative: true },
  },
})
expectType<ReturnType<typeof cssMacro>>(cssMacro({ dynamic: true }))
expectError(cssMacro({ variantsMap: { bad: { value: 123 } } }))

expectAssignable<PostcssCssMacroOptions>({})
expectAssignable<PluginCreator<PostcssCssMacroOptions>>(postcssCssMacro)

expectAssignable<HtmlTransformOptions>({ platform: 'h5', removeUniversal: true })
expectAssignable<PluginCreator<HtmlTransformOptions>>(postcssHtmlTransform)

const resetOptions: Parameters<typeof resetPlugin>[0] = { imageReset: false }
expectAssignable<Parameters<typeof resetPlugin>[0]>(resetOptions)
expectType<ReturnType<typeof resetPlugin>>(resetPlugin({ buttonReset: false }))
expectType<ReturnType<typeof reset>>(reset({ imageReset: false }))
expectError(resetPlugin({ buttonReset: { declarations: { padding: true } } }))

const ignored = weappTwIgnore`foo${'bar'}`
expectType<string>(ignored)
expectType<string>(escape('<view class="foo"></view>'))
expectType<boolean>(isAllowedClassName('text-sm'))
expectType<string>(unescape('text-sm'))
