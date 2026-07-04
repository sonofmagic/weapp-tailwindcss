import type { BundlerAppBranchName } from '../../branches'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { GenericWebpackPlugin } from './generic'
import { MpxWebpackPlugin } from './mpx'
import { TaroWebpackPlugin } from './taro'
import { UniAppWebpackPlugin } from './uni-app'
import { WeappViteWebpackPlugin } from './weapp-vite'

export function createWebpackFrameworkPlugin(branch: BundlerAppBranchName, options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  switch (branch) {
    case 'mpx-webpack':
      return new MpxWebpackPlugin(options)
    case 'taro-webpack':
      return new TaroWebpackPlugin(options)
    case 'uni-app-webpack':
      return new UniAppWebpackPlugin(options)
    case 'generic-webpack':
      return new GenericWebpackPlugin(options)
    default:
      return new WeappViteWebpackPlugin(options)
  }
}
