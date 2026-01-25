import type {
  AppType,
  CreateJsHandlerOptions,
  CssPreflightOptions,
  DisabledOptions,
  IArbitraryValues,
  ICustomAttributes,
  ICustomAttributesEntities,
  IStyleHandlerOptions,
  ITemplateHandlerOptions,
  JsModuleGraphOptions,
  UserDefinedOptions,
} from 'weapp-tailwindcss/types'
import { expectAssignable, expectError, expectNotAssignable, expectType } from 'tsd'

expectAssignable<AppType>('taro')
expectAssignable<AppType>('weapp-vite')
expectNotAssignable<AppType>('unknown')

const disabledOptions: DisabledOptions = {
  plugin: true,
  rewriteCssImports: false,
}
expectAssignable<DisabledOptions>(disabledOptions)

const customAttributesRecord: ICustomAttributes = {
  '*': ['class', /[Cc]lass/],
  'van-image': ['custom-class'],
}
expectAssignable<ICustomAttributes>(customAttributesRecord)

const customAttributesMap: ICustomAttributes = new Map<RegExp, string[]>([[/[Cc]lass/, ['custom-class']]])
expectAssignable<ICustomAttributes>(customAttributesMap)
expectError<ICustomAttributes>({ '*': [123] })

const customAttributesEntities: ICustomAttributesEntities = [
  ['*', ['class']],
  [/[Cc]lass/, [/test-/]],
]
expectAssignable<ICustomAttributesEntities>(customAttributesEntities)

const arbitraryValues: IArbitraryValues = { allowDoubleQuotes: true }
expectAssignable<IArbitraryValues>(arbitraryValues)

const moduleGraphOptions: JsModuleGraphOptions = {
  resolve: (specifier, importer) => (specifier.startsWith('.') ? `${importer}/${specifier}` : undefined),
  load: id => (id.endsWith('.ts') ? '' : undefined),
  filter: (id, specifier) => id.includes(specifier),
  maxDepth: 2,
}
expectAssignable<JsModuleGraphOptions>(moduleGraphOptions)

const jsHandlerOptions: CreateJsHandlerOptions = {
  filename: 'src/app.ts',
  moduleGraph: moduleGraphOptions,
}
expectAssignable<CreateJsHandlerOptions>(jsHandlerOptions)

const styleHandlerOptions: Partial<IStyleHandlerOptions> = { isMainChunk: true }
expectAssignable<Partial<IStyleHandlerOptions>>(styleHandlerOptions)

const templateHandlerOptions: Partial<ITemplateHandlerOptions> = { quote: '"', inlineWxs: true }
expectAssignable<Partial<ITemplateHandlerOptions>>(templateHandlerOptions)

const matchers: UserDefinedOptions = {
  cssMatcher: (name) => {
    expectType<string>(name)
    return name.endsWith('.wxss')
  },
  htmlMatcher: name => name.endsWith('.wxml'),
  jsMatcher: name => name.endsWith('.js'),
  wxsMatcher: name => name.endsWith('.wxs'),
  mainCssChunkMatcher: (name, appType) => {
    expectType<string>(name)
    expectType<AppType | undefined>(appType)
    return appType !== 'native'
  },
}
expectAssignable<UserDefinedOptions>(matchers)

const lifecycleOptions: UserDefinedOptions = {
  onLoad: () => {},
  onStart: () => {},
  onUpdate: (filename, oldVal, newVal) => {
    expectType<string>(filename)
    expectType<string>(oldVal)
    expectType<string>(newVal)
  },
  onEnd: () => {},
}
expectAssignable<UserDefinedOptions>(lifecycleOptions)

const advancedOptions: UserDefinedOptions = {
  appType: 'taro',
  disabled: disabledOptions,
  customAttributes: customAttributesRecord,
  customReplaceDictionary: { foo: 'bar' },
  ignoreTaggedTemplateExpressionIdentifiers: ['weappTwIgnore', /ignore/],
  ignoreCallExpressionIdentifiers: ['twMerge'],
  cssPreflight: { 'box-sizing': 'border-box' } as CssPreflightOptions,
  cssPreflightRange: 'all',
  cssCalc: ['--spacing', /--color/],
  injectAdditionalCssVarScope: true,
  rewriteCssImports: false,
  cssSelectorReplacement: { root: ['page'], universal: false },
  rem2rpx: true,
  px2rpx: true,
  replaceRuntimePackages: { 'tailwind-merge': '@weapp-tailwindcss/merge' },
  jsPreserveClass: keyword => keyword.startsWith('*'),
  cache: true,
  babelParserOptions: { sourceType: 'module' },
  cssChildCombinatorReplaceValue: ['view + view', 'text + text'],
  cssRemoveHoverPseudoClass: true,
  cssRemoveProperty: false,
  logLevel: 'warn',
  arbitraryValues,
  inlineWxs: false,
}
expectAssignable<UserDefinedOptions>(advancedOptions)

expectError<UserDefinedOptions>({ logLevel: 'verbose' })
expectError<UserDefinedOptions>({ cssPreflightRange: 'alll' })
expectError<UserDefinedOptions>({ cssSelectorReplacement: { root: 1 } })
