import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createGenericVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    branchName: 'generic-vite',
  })
}
