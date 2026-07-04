import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createUniAppVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    branchName: 'uni-app-vite',
  })
}
