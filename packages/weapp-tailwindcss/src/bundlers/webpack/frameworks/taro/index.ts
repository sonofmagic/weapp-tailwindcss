import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { WebpackFrameworkPlugin } from '../../shared/create-framework-plugin'

export class TaroWebpackPlugin extends WebpackFrameworkPlugin {
  constructor(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
    super(options, {
      branchName: 'taro-webpack',
    })
  }
}
