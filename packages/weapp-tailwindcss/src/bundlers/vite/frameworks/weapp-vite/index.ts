import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createWeappVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    branchName: 'weapp-vite',
  })
}
