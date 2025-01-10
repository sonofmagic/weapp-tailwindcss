import type { ClassGenerator, IClassGeneratorOptions } from '@tailwindcss-mangle/shared'

export interface IMangleOptions {
  classGenerator?: IClassGeneratorOptions
  mangleClassFilter?: (className: string) => boolean
}

export interface IMangleScopeContext {
  rawOptions: boolean | IMangleOptions | undefined
  runtimeSet: Set<string>
  classGenerator: ClassGenerator
  filter: (className: string) => boolean
  cssHandler: (rawSource: string) => string
  jsHandler: (rawSource: string) => string
  wxmlHandler: (rawSource: string) => string
}
