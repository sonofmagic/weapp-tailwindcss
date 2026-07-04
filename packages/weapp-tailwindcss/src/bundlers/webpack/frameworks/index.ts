import type { WebpackFrameworkName } from '../../framework-selector'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { GenericWebpackPlugin } from './generic'
import { MpxWebpackPlugin } from './mpx'
import { TaroWebpackPlugin } from './taro'
import { UniAppWebpackPlugin } from './uni-app'
import { WeappViteWebpackPlugin } from './weapp-vite'

export function createWebpackFrameworkPlugin(frameworkName: WebpackFrameworkName, options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  switch (frameworkName) {
    case 'mpx':
      return new MpxWebpackPlugin(options)
    case 'taro':
      return new TaroWebpackPlugin(options)
    case 'uni-app':
      return new UniAppWebpackPlugin(options)
    case 'generic':
      return new GenericWebpackPlugin(options)
    case 'weapp-vite':
    default:
      return new WeappViteWebpackPlugin(options)
  }
}
