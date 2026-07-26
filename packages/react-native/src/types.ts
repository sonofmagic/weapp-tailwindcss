export type NativePlatform = 'android' | 'ios' | 'native' | 'web'

export interface NativeStyleEnvironment {
  colorScheme?: 'light' | 'dark' | undefined
  platform?: NativePlatform | undefined
}

export interface NativeStyleRule {
  style: Record<string, unknown>
  colorScheme?: 'dark' | undefined
  platform?: NativePlatform | undefined
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
  variables: Record<string, string>
  warnings: NativeCompilerWarning[]
}

export interface CompileNativeStylesheetOptions {
  classSet?: Iterable<string> | undefined
  ignorePreflight?: boolean | undefined
}

export type NativeClassValue = string | false | null | undefined | NativeClassValue[] | Record<string, boolean>

export interface NativeStyleRuntime {
  tw: (value: NativeClassValue, environment?: NativeStyleEnvironment) => Record<string, unknown>
  setManifest: (manifest: NativeStyleManifest) => void
  setEnvironment: (environment: NativeStyleEnvironment) => void
  getManifest: () => NativeStyleManifest | undefined
}
