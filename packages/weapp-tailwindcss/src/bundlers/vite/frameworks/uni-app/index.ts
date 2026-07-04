import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createUniAppVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'uni-app',
    styleInjectorDelegate: viteStyleInjectorDelegates.uniApp,
  })
}
