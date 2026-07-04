import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { WebpackFrameworkPlugin } from '../../shared/create-framework-plugin'

export class WeappViteWebpackPlugin extends WebpackFrameworkPlugin {
  constructor(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
    super(options, {
      branchName: 'generic-webpack',
    })
  }
}
