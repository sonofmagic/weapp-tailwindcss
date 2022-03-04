import type { UserDefinedOptions, AppType } from './types'

export interface IBaseWebpackPlugin {
  // new (options: UserDefinedOptions, appType: AppType): any
  // constructor(options: UserDefinedOptions, appType: AppType): void
  options: Required<UserDefinedOptions>
  appType: AppType
  apply: (compiler: any) => void
}
