export type NativePlatform = 'android' | 'ios' | 'native' | 'web'

export interface NativeStyleEnvironment {
  colorScheme?: 'light' | 'dark' | undefined
  platform?: NativePlatform | undefined
}

export interface NativeStyleRule {
  style: Record<string, unknown>
  colorScheme?: 'dark' | undefined
  platform?: NativePlatform | undefined
  important?: boolean | undefined
  order?: number | undefined
  id?: string | undefined
}

export interface NativeCompilerWarning {
  className?: string | undefined
  property?: string | undefined
  message: string
}

export interface NativeStyleManifest {
  version: 1
  classSet: string[]
  rules: Record<string, NativeStyleRule[]>
  /** 可直接交给 StyleSheet.create 的稳定规则表。 */
  styleSheet?: Record<string, Record<string, unknown>>
  /** styleSheet 规则的条件和优先级元数据。 */
  styleEntries?: Record<string, NativeStyleRule>
  /** 每个 class token 对应的静态 style ID，Babel 编译结果直接使用它。 */
  staticLookup?: Record<string, string[]>
  variables: Record<string, string>
  warnings: NativeCompilerWarning[]
}

export interface CompileNativeStylesheetOptions {
  classSet?: Iterable<string> | undefined
  ignorePreflight?: boolean | undefined
}

export type NativeClassValue = string | false | null | undefined | NativeClassValue[] | Record<string, boolean>
export type NativeStyleValue = Record<string, unknown> | number | readonly NativeStyleValue[]

export interface NativeStyleRuntime {
  tw: (value: NativeClassValue, environment?: NativeStyleEnvironment) => NativeStyleValue
  getStaticStyle: (ids: readonly string[], environment?: NativeStyleEnvironment) => NativeStyleValue
  composeStyle: (tailwindStyle: NativeStyleValue, inlineStyle: unknown) => NativeStyleValue[]
  setManifest: (manifest: NativeStyleManifest) => void
  setEnvironment: (environment: NativeStyleEnvironment) => void
  getManifest: () => NativeStyleManifest | undefined
}
