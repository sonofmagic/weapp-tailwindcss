import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createWeappVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'weapp-vite',
    styleInjectorDelegate: viteStyleInjectorDelegates.generic,
  })
}
