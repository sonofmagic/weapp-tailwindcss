import type { UserDefinedOptions, AppType } from './types'
import type ClassGenerator from '@/mangle/classGenerator'
export interface IBaseWebpackPlugin {
  // new (options: UserDefinedOptions, appType: AppType): any
  // constructor(options: UserDefinedOptions, appType: AppType): void
  options: Required<UserDefinedOptions>
  appType: AppType
  classGenerator?: ClassGenerator

  apply: (compiler: any) => void
}
